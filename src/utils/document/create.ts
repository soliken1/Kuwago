import axios from "axios";
import sendDocumentLink from "@/utils/document/send";

const createDocument = async (selectedLoan: any, storedUser: any) => {
  const apiKey = process.env.PANDADOC_API_KEY;
  const templateId = process.env.PANDADOC_TEMPLATE_ID;

  const payload = {
    name: "Loan Approval Test Document",
    template_uuid: templateId,
    recipients: [
      {
        email: selectedLoan.userInfo.email,
        first_name: selectedLoan.loanInfo.firstName,
        last_name: selectedLoan.loanInfo.lastName,
        role: "Borrower",
      },
      {
        email: storedUser.email,
        first_name: storedUser.fullname,
        role: "Lender",
      },
    ],
    tokens: [],
    fields: {},
    metadata: {
      loanId: selectedLoan.loanInfo.loanRequestID,
    },
    send_email: true,
  };

  const response = await axios.post(
    "https://api.pandadoc.com/public/v1/documents",
    payload,
    {
      headers: {
        Authorization: `API-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const url = `https://app.pandadoc.com/a/#/documents/${response.data.uuid}`;
  await sendDocumentLink(
    storedUser.email,
    storedUser.fullname,
    url,
    `Generated Document For ${selectedLoan.loanInfo.firstName} ${selectedLoan.loanInfo.lastName}`
  );
};

export default createDocument;
