import type { NextApiRequest, NextApiResponse } from "next";
import * as pd_api from "pandadoc-node-client";

const PDF_URL =
  "https://app.pandadoc.com/a/#/templates/ZJkiQmxXSU9YKBdDTQjr59/content";

const config = pd_api.createConfiguration({
  authMethods: { apiKey: `API-Key ${process.env.PANDADOC_API_KEY}` },
});
const apiInstance = new pd_api.DocumentsApi(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { borrowerEmail, lenderEmail } = req.body;
  if (typeof borrowerEmail !== "string" || typeof lenderEmail !== "string") {
    return res.status(400).json({ error: "Both emails must be strings" });
  }

  try {
    const docRes = await apiInstance.createDocument({
      documentCreateRequest: {
        name: "Test PDF",
        url: PDF_URL,
        recipients: [
          {
            email: borrowerEmail,
            firstName: "Borrower",
            lastName: "User",
            role: "borrower",
            signingOrder: 1,
          },
          {
            email: lenderEmail,
            firstName: "Lender",
            lastName: "User",
            role: "lender",
            signingOrder: 2,
          },
        ],

        parseFormFields: false,
      },
    });
    const documentId = docRes.id as string;

    const linkRes = await apiInstance.createDocumentLink({
      id: documentId,
      documentCreateLinkRequest: { recipient: borrowerEmail, lifetime: 7200 },
    });
    const url = (linkRes as any).link;
    if (!url) throw new Error("No link in response");

    return res.status(200).json({ url });
  } catch (err: any) {
    console.error("PandaDoc Error:", err);
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
}
