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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing document ID" });
    }

    // Initial document check with type safety
    let document = await apiInstance.detailsDocument({ id });
    let retries = 5;

    // Handle async processing states with proper type checking
    while (
      retries > 0 &&
      document.status &&
      ["document.uploaded", "document.processing"].includes(document.status)
    ) {
      await delay(2000);
      document = await apiInstance.detailsDocument({ id });
      retries--;
    }

    // Ensure status exists before proceeding
    if (!document.status) {
      throw new Error("Document status is undefined");
    }

    // Handle draft state
    if (document.status === "document.draft") {
      return res.status(200).json({
        status: document.status,
        message: "Document is ready but not sent to recipients",
        nextAction: "Send the document to recipients or use embedded signing",
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

      return res.status(200).json({
        status: document.status,
        signingUrl: (linkRes as any).link,
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
        info: "Please wait and check again later",
      });
    }

    return res.status(500).json({
      error: "Document processing failed",
      details: err.message,
    });
  }
}
