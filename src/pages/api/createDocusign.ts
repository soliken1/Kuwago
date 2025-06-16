import type { NextApiRequest, NextApiResponse } from "next";
import docusign from "docusign-esign";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      borrowerName,
      borrowerEmail,
      lenderName,
      lenderEmail,
      loanAmount,
      loanDate,
    } = req.body;

    if (!borrowerName || !borrowerEmail || !lenderName || !lenderEmail) {
      return res.status(400).json({ error: "Missing required signer info" });
    }

    console.log("[DocuSign] Initializing API client...");

    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH!);

    const privateKeyPath = path.resolve(
      process.cwd(),
      process.env.DOCUSIGN_PRIVATE_KEY_FILE!
    );
    console.log(`[DocuSign] Reading private key from: ${privateKeyPath}`);
    const privateKey = fs.readFileSync(privateKeyPath);

    console.log("[DocuSign] Requesting JWT user token...");
    const authResponse = await apiClient.requestJWTUserToken(
      process.env.DOCUSIGN_INTEGRATION_KEY!,
      process.env.DOCUSIGN_USER_ID!,
      ["signature", "impersonation"],
      privateKey,
      3600
    );

    const accessToken = authResponse.body.access_token;
    console.log("[DocuSign] Received access token.");
    apiClient.addDefaultHeader("Authorization", `Bearer ${accessToken}`);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    const pdfPath = path.resolve(process.cwd(), "documents/loan-agreement.pdf");
    const pdfBytes = fs.readFileSync(pdfPath);
    const documentBase64 = Buffer.from(pdfBytes).toString("base64");
    console.log("PDF size:", pdfBytes.length);

    const envelopeDefinition: docusign.EnvelopeDefinition = {
      emailSubject: "Loan Agreement for Signature",
      documents: [
        {
          documentBase64,
          name: "Loan Agreement.pdf",
          fileExtension: "pdf",
          documentId: "1",
        },
      ],

      recipients: {
        signers: [
          {
            email: borrowerEmail,
            name: borrowerName,
            recipientId: "1",
            routingOrder: "1",
            clientUserId: "1",
            tabs: {
              signHereTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "100",
                  yPosition: "150",
                },
              ],
            },
          },
          {
            email: lenderEmail,
            name: lenderName,
            recipientId: "2",
            routingOrder: "2",
            tabs: {
              signHereTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "100",
                  yPosition: "150",
                },
              ],
            },
          },
        ],
      },
      status: "sent",
    };

    console.log("[DocuSign] Creating envelope...");
    const result = await envelopesApi.createEnvelope(
      process.env.DOCUSIGN_ACCOUNT_ID!,
      { envelopeDefinition }
    );

    console.log("[DocuSign] Envelope created:", result.envelopeId);

    const viewRequest = {
      returnUrl: `${process.env.NEXTAUTH_URL}/loan-complete`,
      authenticationMethod: "none",
      email: borrowerEmail,
      userName: borrowerName,
      clientUserId: "1",
    };

    console.log("[DocuSign] Creating recipient view...");
    const signingUrl = await envelopesApi.createRecipientView(
      process.env.DOCUSIGN_ACCOUNT_ID!,
      result.envelopeId!,
      { recipientViewRequest: viewRequest }
    );

    console.log("[DocuSign] Returning signing URL");
    res.status(200).json({ url: signingUrl.url });
  } catch (err: any) {
    console.error("DocuSign error:", err.stack || err.message || err);

    const isDev = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: "Failed to initiate DocuSign process",
      ...(isDev && { details: err.message || err.toString() }),
    });
  }
}
