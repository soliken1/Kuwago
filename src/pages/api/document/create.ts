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
    const { borrowerEmail, lenderEmail, loanAmount, borrowerName, lenderName } =
      req.body;

    // Validate inputs
    if (!borrowerEmail || !lenderEmail || !loanAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create document
    const docRes = await apiInstance.createDocument({
      documentCreateRequest: {
        name: `Loan Agreement - ${borrowerName} & ${lenderName}`,
        templateUuid: process.env.PANDADOC_TEMPLATE_ID,
        recipients: [
          {
            email: borrowerEmail,
            firstName: borrowerName.split(" ")[0] || "Borrower",
            lastName: borrowerName.split(" ")[1] || "Customer",
            role: "Borrower",
            signingOrder: 1,
          },
          {
            email: lenderEmail,
            firstName: lenderName.split(" ")[0] || "Lender",
            lastName: lenderName.split(" ")[1] || "Partner",
            role: "Lender",
            signingOrder: 2,
          },
        ],
        fields: {
          loanAmount: { value: loanAmount },
          borrowerName: { value: borrowerName },
          lenderName: { value: lenderName },
          agreementDate: { value: new Date().toISOString().split("T")[0] },
        },
        metadata: {
          loanAmount: loanAmount,
          borrowerEmail: borrowerEmail,
          lenderEmail: lenderEmail,
        },
        tags: ["loan-agreement"],
        parseFormFields: true,
      },
    });

    return res.status(200).json({
      documentId: docRes.id,
      status: "document.uploaded", // Initial status
    });
  } catch (err: any) {
    console.error("PandaDoc Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to create document",
      details: err.response?.body || {},
    });
  }
}
