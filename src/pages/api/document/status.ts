import type { NextApiRequest, NextApiResponse } from "next";
import * as pd_api from "pandadoc-node-client";

const config = pd_api.createConfiguration({
  authMethods: { apiKey: `API-Key ${process.env.PANDADOC_API_KEY}` },
});
const apiInstance = new pd_api.DocumentsApi(config);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!["GET", "POST"].includes(req.method || "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing document ID" });
    }

    // Get document details with error handling
    const document = await apiInstance.detailsDocument({ id });

    // Handle processing states
    if (!document.status || document.status === "document.uploaded") {
      return res.status(200).json({
        status: "processing",
        documentId: id,
        message: "Document is being processed",
        estimatedWait: 30, // seconds
        nextCheckAfter: 5, // seconds
      });
    }

    // Handle draft state
    if (document.status === "document.draft") {
      return res.status(200).json({
        status: "ready",
        documentId: id,
        state: "draft",
        message: "Document is ready for signing",
        actionRequired: "send", // or 'embedded_sign'
      });
    }

    // Handle sent state - generate signing link
    if (document.status === "document.sent") {
      const recipientEmail = document.recipients?.[0]?.email;
      if (!recipientEmail) {
        throw new Error("No recipient email found");
      }

      const linkRes = await apiInstance.createDocumentLink({
        id,
        documentCreateLinkRequest: {
          recipient: recipientEmail,
          lifetime: 3600,
        },
      });

      return res.status(200).json({
        status: "ready",
        documentId: id,
        state: "sent",
        signingUrl: (linkRes as any).link,
        expiresAt: Date.now() + 3600000, // 1 hour from now
      });
    }

    // Handle other states
    return res.status(200).json({
      status: "unknown",
      documentId: id,
      state: document.status,
      message: `Document is in ${document.status} state`,
    });
  } catch (err: any) {
    console.error("PandaDoc Error:", {
      message: err.message,
      code: err.code,
      details: err.response?.body || {},
    });

    // Special handling for 409 conflict (processing state)
    if (err.code === 409) {
      return res.status(200).json({
        status: "processing",
        message: "Document is still being processed",
        info: err.response?.body?.info_message || "Please wait",
        nextCheckAfter: 5, // seconds
      });
    }

    return res.status(500).json({
      error: "Document processing failed",
      details: err.message,
    });
  }
}
