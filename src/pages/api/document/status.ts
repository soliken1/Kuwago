import type { NextApiRequest, NextApiResponse } from "next";
import * as pd_api from "pandadoc-node-client";

const config = pd_api.createConfiguration({
  authMethods: { apiKey: `API-Key ${process.env.PANDADOC_API_KEY}` },
});
const apiInstance = new pd_api.DocumentsApi(config);

// Enhanced delay with jitter
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const calculateDelay = (attempt: number) => {
  const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
  const jitter = Math.random() * 1000;
  return baseDelay + jitter;
};

// Document cache with 5-second TTL
const documentCache = new Map<
  string,
  {
    data: any;
    timestamp: number;
  }
>();

// Helper to make rate-limit aware API calls
const fetchWithRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 5
): Promise<T> => {
  let attempt = 0;
  let lastError: any;

  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      attempt++;

      if (err.code === 429) {
        const retryAfter =
          parseInt(err.response?.headers?.["retry-after"]) ||
          calculateDelay(attempt);
        console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
        await delay(retryAfter);
        continue;
      }

      // For non-rate-limit errors, break immediately
      break;
    }
  }

  throw lastError || new Error("Failed after retries");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing document ID" });
    }

    // Check cache first
    const cached = documentCache.get(id);
    if (cached && Date.now() - cached.timestamp < 5000) {
      return res.status(200).json(cached.data);
    }

    // Initial document check with retry logic
    let document = await fetchWithRetry(() =>
      apiInstance.detailsDocument({ id })
    );
    let retries = 5;

    // Handle async processing states
    while (
      retries > 0 &&
      document.status &&
      ["document.uploaded", "document.processing"].includes(document.status)
    ) {
      await delay(calculateDelay(5 - retries)); // Progressive backoff
      document = await fetchWithRetry(() =>
        apiInstance.detailsDocument({ id })
      );
      retries--;
    }

    // Ensure status exists before proceeding
    if (!document.status) {
      throw new Error("Document status is undefined");
    }

    let responseData: any;

    // Handle draft state
    if (document.status === "document.draft") {
      responseData = {
        status: document.status,
        message: "Document is ready but not sent to recipients",
        nextAction: "Send the document to recipients or use embedded signing",
      };
    }
    // Handle sent state
    else if (document.status === "document.sent") {
      const recipientEmail = document.recipients?.[0]?.email;
      if (!recipientEmail) {
        throw new Error("No recipient email found for signing");
      }

      const linkRes = await fetchWithRetry(() =>
        apiInstance.createDocumentLink({
          id,
          documentCreateLinkRequest: {
            recipient: recipientEmail,
            lifetime: 3600,
          },
        })
      );

      responseData = {
        status: document.status,
        signingUrl: (linkRes as any).link,
      };
    }
    // Handle other states
    else {
      responseData = {
        status: document.status,
        message: `Document is in ${document.status} state`,
      };
    }

    // Update cache
    documentCache.set(id, {
      data: responseData,
      timestamp: Date.now(),
    });

    return res.status(200).json(responseData);
  } catch (err: any) {
    console.error("PandaDoc Error:", {
      message: err.message,
      code: err.code,
      details: err.response?.body || {},
    });

    if (err.code === 409) {
      return res.status(200).json({
        status: "processing",
        message: "Document is still being processed",
        info: "Please wait and check again later",
      });
    }

    if (err.code === 429) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Please try again later",
        retryAfter: parseInt(err.response?.headers?.["retry-after"]) || 30,
      });
    }

    return res.status(500).json({
      error: "Document processing failed",
      details: err.message,
    });
  }
}
