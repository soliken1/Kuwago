import type { NextApiRequest, NextApiResponse } from "next";
import * as pd_api from "pandadoc-node-client";

const config = pd_api.createConfiguration({
  authMethods: { apiKey: `API-Key ${process.env.PANDADOC_API_KEY}` },
});
const apiInstance = new pd_api.DocumentsApi(config);

interface SigningLinkResponse {
  link: string;
  expires_at?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Accept both GET and POST methods
  if (!["GET", "POST"].includes(req.method || "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get ID from either query params (GET) or request body (POST)
    const id =
      req.method === "GET"
        ? req.query.id
        : typeof req.body === "object"
        ? req.body.id
        : null;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing document ID" });
    }

    // Get document details
    const document = await apiInstance.detailsDocument({ id });

    if (!document.status) {
      throw new Error("Document status is undefined");
    }

    // Handle sent state - generate signing link
    if (document.status === "document.sent") {
      const recipientEmail = document.recipients?.[0]?.email;
      if (!recipientEmail) {
        throw new Error("No recipient email found for signing");
      }

      const linkRes = await apiInstance.createDocumentLink({
        id,
        documentCreateLinkRequest: {
          recipient: recipientEmail,
          lifetime: 3600,
        },
      });

      const signingUrl = linkRes as unknown as SigningLinkResponse;

      if (!signingUrl.link) {
        throw new Error("No signing URL in response");
      }

      return res.status(200).json({
        status: document.status,
        signingUrl: signingUrl.link,
        expiresAt: signingUrl.expires_at,
      });
    }

    // Handle other states
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

    return res.status(500).json({
      error: "Document processing failed",
      details: err.message,
    });
  }
}
