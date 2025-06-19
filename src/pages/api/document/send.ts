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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      documentId,
      message = "Please sign this document",
      subject = "Document for Signature",
    } = req.body;

    if (!documentId || typeof documentId !== "string") {
      return res.status(400).json({ error: "Missing or invalid document ID" });
    }

    // 1. Check document status first
    const document = await apiInstance.detailsDocument({ id: documentId });

    if (!document.status) {
      throw new Error("Document status is undefined");
    }

    // 2. Only allow sending if document is in a sendable state
    if (document.status === "document.draft") {
      return res.status(400).json({
        error: "Document is still in draft state",
        status: document.status,
        nextCheckAfter: 5, // Suggest waiting 5 seconds
      });
    }

    // 3. Force send with email parameters
    await apiInstance.sendDocument({
      id: documentId,
      documentSendRequest: {
        message: message,
        subject: subject,
        silent: false,
        // Use the correct parameter name for recipients
        recipients:
          document.recipients?.map((recipient) => ({
            email: recipient.email,
            role: recipient.role,
          })) || [],
      } as pd_api.DocumentSendRequest, // Type assertion if needed
    });

    // 4. Get updated document status
    const updatedDoc = await apiInstance.detailsDocument({ id: documentId });

    // 5. Return signing link if available
    if (updatedDoc.status === "document.sent") {
      const recipientEmail = updatedDoc.recipients?.[0]?.email;
      if (recipientEmail) {
        const linkRes = await apiInstance.createDocumentLink({
          id: documentId,
          documentCreateLinkRequest: {
            recipient: recipientEmail,
            lifetime: 3600,
          },
        });

        const signingUrl = (linkRes as any).link;
        if (signingUrl) {
          return res.status(200).json({
            status: updatedDoc.status,
            signingUrl,
            success: true,
          });
        }
      }
    }

    return res.status(200).json({
      status: updatedDoc.status,
      success: true,
      message: "Document sent successfully",
    });
  } catch (err: any) {
    console.error("PandaDoc Send Error:", {
      message: err.message,
      code: err.code,
      details: err.response?.body || {},
    });

    // Handle 409 Conflict (document not ready)
    if (err.code === 409) {
      return res.status(409).json({
        error: "Document not ready for sending",
        details: err.message,
        nextCheckAfter: 5,
      });
    }

    return res.status(500).json({
      error: "Failed to send document",
      details: err.message,
    });
  }
}
