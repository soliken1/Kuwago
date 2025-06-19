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

interface StatusRequestBody {
  id: string;
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
    let id: string | undefined;

    // Handle GET request (ID in query params)
    if (req.method === "GET") {
      id = req.query.id as string;
    }
    // Handle POST request (ID in request body)
    else if (req.method === "POST") {
      // Parse and validate request body
      if (req.headers["content-type"] !== "application/json") {
        return res
          .status(400)
          .json({ error: "Content-Type must be application/json" });
      }

      let body: StatusRequestBody;
      try {
        body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        if (!body.id || typeof body.id !== "string") {
          return res
            .status(400)
            .json({ error: "Missing or invalid document ID in request body" });
        }
        id = body.id;
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    if (!id) {
      return res.status(400).json({ error: "Missing document ID" });
    }

    // Get document details
    const document = await apiInstance.detailsDocument({ id });

    if (!document.status) {
      throw new Error("Document status is undefined");
    }

    // Handle processing states
    if (document.status === "document.uploaded") {
      return res.status(200).json({
        status: "processing",
        documentId: id,
        message: "Document is being processed",
        estimatedWait: 30,
        nextCheckAfter: 5,
      });
    }

    // Handle draft state
    if (document.status === "document.draft") {
      return res.status(200).json({
        status: "ready",
        documentId: id,
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
        status: "ready",
        documentId: id,
        state: "sent",
        signingUrl: signingUrl.link,
        expiresAt: signingUrl.expires_at,
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
