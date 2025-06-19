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

    // Create proper request object
    const detailsRequest: pd_api.DocumentsApiDetailsDocumentRequest = {
      id: id,
    };

    // Get document details
    const document = await apiInstance.detailsDocument(detailsRequest);

    // If document is ready, generate signing link
    if (document.status === "document.draft") {
      const linkRequest: pd_api.DocumentsApiCreateDocumentLinkRequest = {
        id: id,
        documentCreateLinkRequest: {
          recipient: document.recipients?.[0]?.email || "",
          lifetime: 3600, // 1 hour expiration
        },
      };

      const linkRes = await apiInstance.createDocumentLink(linkRequest);

      return res.status(200).json({
        status: document.status,
        signingUrl: (linkRes as any).link,
      });
    }

    // Document still processing
    return res.status(200).json({
      status: document.status || "document.uploaded",
    });
  } catch (err: any) {
    console.error("PandaDoc Status Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to check document status",
      status: "error",
      details: err.response?.body || {},
    });
  }
}
