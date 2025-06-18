import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export const config = { api: { bodyParser: false } };

function getSignatureFromHeaders(req: NextApiRequest): string | null {
  const potentialHeaders = [
    "x-pandadoc-signature",
    "x-panda-signature",
    "X-PandaDoc-Signature",
    "X-Panda-Signature",
    "$x_pandadoc_signature",
  ];

  const getHeaderString = (headerName: string): string | null => {
    const headerValue =
      req.headers[headerName.toLowerCase()] || req.headers[headerName];
    if (!headerValue) return null;

    // Handle Vercel's transformed signature
    if (headerName.startsWith("$x_")) {
      const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
      return value.startsWith("$x_") ? value.slice(3) : value;
    }

    return Array.isArray(headerValue) ? headerValue[0] : headerValue;
  };

  for (const headerName of potentialHeaders) {
    const value = getHeaderString(headerName);
    if (value) {
      console.log(`Found signature in header ${headerName}: ${value}`);
      return value;
    }
  }

  // Check Vercel's special headers as fallback
  try {
    const scHeaders = req.headers["x-vercel-sc-headers"];
    if (scHeaders) {
      const headers = JSON.parse(
        Array.isArray(scHeaders) ? scHeaders[0] : scHeaders
      );
      for (const headerName of potentialHeaders) {
        if (headers[headerName]) {
          const value = headers[headerName];
          return Array.isArray(value) ? value[0] : value;
        }
      }
    }
  } catch (e) {
    console.error("Error parsing x-vercel-sc-headers:", e);
  }

  return null;
}

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await getRawBody(req);
    const bodyString = rawBody.toString("utf8");
    const signature = getSignatureFromHeaders(req);

    if (!signature) {
      console.error("Signature headers missing. Received:", req.headers);
      return res.status(400).json({
        error: "Missing signature header",
        receivedHeaders: Object.keys(req.headers),
      });
    }

    const webhookKey = process.env.PANDADOC_WEBHOOK_KEY;
    if (!webhookKey) {
      return res.status(500).json({ error: "Webhook key not configured" });
    }

    // Compute signatures for comparison
    const computedHex = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("hex");

    const computedBase64 = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("base64");

    // Debug logging
    console.log("Signature verification:", {
      received: signature,
      computedHex,
      computedBase64,
      body: bodyString,
    });

    if (computedHex !== signature && computedBase64 !== signature) {
      return res.status(401).json({
        error: "Invalid signature",
        details: {
          received: signature,
          computedHex,
          computedBase64,
          note: "Check if Vercel is modifying the signature header",
        },
      });
    }

    // Process webhook events
    const events = JSON.parse(bodyString);
    console.log("Processing webhook events:", events);

    for (const event of events) {
      switch (event.event) {
        case "document_state_changed":
          console.log(
            `Document ${event.data.id} changed to ${event.data.status}`
          );
          break;
        case "document_creation_failed":
          console.error("Creation failed:", event.data.error.detail);
          break;
        case "document_completed":
          console.log(`Document ${event.data.id} completed`);
          break;
        case "document_sent":
          console.log(`Document ${event.data.id} sent`);
          break;
        case "recipient_completed":
          console.log(`Recipient ${event.data.recipient.email} completed`);
          break;
        default:
          console.log(`Unhandled event: ${event.event}`);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
