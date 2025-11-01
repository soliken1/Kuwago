import axios from "axios";

const createDocument = async (selectedLoan: any, storedUser: any) => {
  const apiKey = process.env.PANDADOC_API_KEY;
  const templateId = process.env.PANDADOC_TEMPLATE_ID;

  const payload = {
    name: "Loan Approval Document",
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

  await axios.post("https://api.pandadoc.com/public/v1/documents", payload, {
    headers: {
      Authorization: `API-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
};

export default createDocument;
