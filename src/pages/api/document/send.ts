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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing document ID" });
    }

    // Get document details with proper typing
    const detailsRequest: pd_api.DocumentsApiDetailsDocumentRequest = { id };
    const document = await apiInstance.detailsDocument(detailsRequest);

    if (!document.status) {
      throw new Error("Document status is undefined");
    }

    // Handle sent state - generate signing link
    if (document.status === "document.sent") {
      const recipientEmail = document.recipients?.[0]?.email;
      if (!recipientEmail) {
        throw new Error("No recipient email found for signing");
      }

      // Properly typed request
      const linkRequest: pd_api.DocumentsApiCreateDocumentLinkRequest = {
        id,
        documentCreateLinkRequest: {
          recipient: recipientEmail,
          lifetime: 3600,
        },
      };

      // Type assertion for the response
      const linkRes = await apiInstance.createDocumentLink(linkRequest);
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
