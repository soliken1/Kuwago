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

interface RequestBody {
  documentId?: string;
  id?: string; // Accept both for backward compatibility
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!["GET", "POST"].includes(req.method || "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let documentId: string | undefined;

    // Handle GET request
    if (req.method === "GET") {
      documentId = req.query.id as string;
    }
    // Handle POST request
    else {
      const body: RequestBody =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      // Accept either 'documentId' or 'id' in the request body
      documentId = body.documentId || body.id;
    }

    if (!documentId) {
      return res.status(400).json({
        error: "Missing document ID",
        details: "Please provide 'documentId' in the request body",
      });
    }

    // Get document details
    const document = await apiInstance.detailsDocument({ id: documentId });

    if (!document.status) {
      throw new Error("Document status is undefined");
    }

    // Handle processing states
    if (document.status === "document.uploaded") {
      return res.status(200).json({
        status: "processing",
        documentId,
        id: documentId,
        message: "Document is being processed",
        estimatedWait: 30,
        nextCheckAfter: 5,
      });
    }

    // Handle draft state
    if (document.status === "document.draft") {
      return res.status(200).json({
        status: "ready",
        documentId,
        id: documentId,
        state: "draft",
        message: "Document is ready for signing",
        actionRequired: "send",
      });
    }

    // Handle sent state
    if (document.status === "document.sent") {
      const recipientEmail = document.recipients?.[0]?.email;
      if (!recipientEmail) {
        throw new Error("No recipient email found for signing");
      }

      const linkRes = await apiInstance.createDocumentLink({
        id: documentId,
        documentCreateLinkRequest: {
          recipient: recipientEmail,
          lifetime: 3600,
        },
      });

      const signingUrl = linkRes as unknown as SigningLinkResponse;

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

    if (err.code === 409) {
      return res.status(200).json({
        status: "processing",
        message: "Document is still being processed",
        info: err.response?.body?.info_message || "Please wait",
        nextCheckAfter: 5,
      });
    }

    return res.status(500).json({
      error: "Document processing failed",
      details: err.message,
    });
  }
}
