import type { NextApiRequest, NextApiResponse } from "next";
import * as pd_api from "pandadoc-node-client";

const config = pd_api.createConfiguration({
  authMethods: { apiKey: `API-Key ${process.env.PANDADOC_API_KEY}` },
});
const apiInstance = new pd_api.DocumentsApi(config);

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

    // Get document details
    const document = await apiInstance.detailsDocument({ id });

    // Document must be sent before creating signing links
    if (document.status === "document.draft") {
      // First send the document to recipients
      await apiInstance.sendDocument({
        id,
        documentSendRequest: {
          silent: false, // Set to true if you don't want emails sent
          subject: "Please sign this document",
          message: "Hello, please review and sign this document",
        },
      });

      return res.status(200).json({
        status: "document.sent",
        message: "Document has been sent to recipients",
      });
    }

    // Only generate signing link if document is sent
    if (document.status === "document.sent") {
      const recipientEmail = document.recipients?.[0]?.email || "";
      if (!recipientEmail) {
        throw new Error("No recipient email found");
      }

      const linkRes = await apiInstance.createDocumentLink({
        id,
        documentCreateLinkRequest: {
          recipient: recipientEmail,
          lifetime: 3600, // 1 hour expiration
        },
      });

      return res.status(200).json({
        status: document.status,
        signingUrl: (linkRes as any).link,
      });
    }

    // For other statuses (like uploaded, completed)
    return res.status(200).json({
      status: document.status,
      message: `Document is in ${document.status} state`,
    });
  } catch (err: any) {
    console.error("PandaDoc Status Error:", {
      message: err.message,
      code: err.code,
      details: err.response?.body || {},
    });

    return res.status(500).json({
      error: "Failed to process document",
      details: {
        message: err.message,
        status: err.response?.status,
        code: err.code,
      },
    });
  }
}
