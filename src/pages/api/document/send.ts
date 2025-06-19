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
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: "Missing document ID" });
    }

    // Send the document to recipients
    await apiInstance.sendDocument({
      id: documentId,
      documentSendRequest: {
        silent: false,
        subject: "Please sign this document",
        message: "Hello, please review and sign this document",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Document sent to recipients",
    });
  } catch (err: any) {
    console.error("Send Document Error:", err);
    return res.status(500).json({
      error: "Failed to send document",
      details: err.message,
    });
  }
}
