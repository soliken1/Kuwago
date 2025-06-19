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

    // Handle draft documents with embedded signing
    if (document.status === "document.draft") {
      try {
        const recipientEmail = document.recipients?.[0]?.email || "";
        const linkRes = await apiInstance.createDocumentLink({
          id,
          documentCreateLinkRequest: {
            recipient: recipientEmail,
            lifetime: 3600,
          },
        });

        return res.status(200).json({
          status: "ready_for_embedded_signing",
          signingUrl: (linkRes as any).link,
        });
      } catch (error) {
        return res.status(403).json({
          error: "Organization restriction",
          message:
            "Cannot send to external emails. Please use organization emails or contact support.",
          solution: "Update recipient emails to use your organization's domain",
        });
      }
    }

    // Handle already sent documents
    if (document.status === "document.sent") {
      const linkRes = await apiInstance.createDocumentLink({
        id,
        documentCreateLinkRequest: {
          recipient: document.recipients?.[0]?.email || "",
          lifetime: 3600,
        },
      });

      return res.status(200).json({
        status: document.status,
        signingUrl: (linkRes as any).link,
      });
    }

    // Other statuses
    return res.status(200).json({
      status: document.status,
      message: `Document is in ${document.status} state`,
    });
  } catch (err: any) {
    console.error("PandaDoc Error:", {
      message: err.message,
      code: err.code,
      details: err.response?.body || {},
    });

    if (err.code === 403) {
      return res.status(403).json({
        error: "Organization restriction",
        message:
          "Your PandaDoc account cannot send documents outside your organization",
        solutions: [
          "Use email addresses from your organization domain",
          "Contact PandaDoc support to enable external sending",
          "Implement embedded signing instead of email delivery",
        ],
      });
    }

    return res.status(500).json({
      error: "Document processing failed",
      details: err.message,
    });
  }
}
