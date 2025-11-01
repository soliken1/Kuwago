import axios from "axios";

interface LoanInfo {
  loanRequestID: string;
  firstName?: string;
  lastName?: string;
  loanAmount: number;
  loanType: number;
  loanPurpose: string;
}

interface UserInfo {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SelectedLoan {
  loanInfo: LoanInfo;
  userInfo: UserInfo;
}

interface StoredUser {
  email?: string;
  fullname?: string;
}

const createDocument = async (
  selectedLoan: SelectedLoan,
  storedUser: StoredUser
) => {
  const apiKey = process.env.PANDADOC_API_KEY;
  const templateId = process.env.PANDADOC_TEMPLATE_ID;
  console.log(templateId);
  if (!apiKey || !templateId) {
    throw new Error("PandaDoc API credentials are not configured");
  }

  const firstName =
    selectedLoan.loanInfo.firstName || selectedLoan.userInfo.firstName;
  const lastName =
    selectedLoan.loanInfo.lastName || selectedLoan.userInfo.lastName;

  const payload = {
    name: `Loan Approval - ${firstName} ${lastName}`,
    template_uuid: templateId,
    recipients: [
      {
        email: selectedLoan.userInfo.email,
        first_name: firstName,
        last_name: lastName,
        role: "Borrower",
      },
      {
        email: storedUser.email || "",
        first_name: storedUser.fullname || "Lender",
        role: "Lender",
      },
    ],
    tokens: [],
    fields: {},
    metadata: {
      loanId: selectedLoan.loanInfo.loanRequestID,
      loanAmount: selectedLoan.loanInfo.loanAmount.toString(),
      loanType: selectedLoan.loanInfo.loanType.toString(),
      loanPurpose: selectedLoan.loanInfo.loanPurpose,
    },
  };

  // Step 1: Create the document
  const createResponse = await axios.post(
    "https://api.pandadoc.com/public/v1/documents",
    payload,
    {
      headers: {
        Authorization: `API-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const documentId = createResponse.data.id;

  // Step 2: Wait for document to be in 'document.draft' status
  // Poll the document status until it's ready
  let documentStatus = "";
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait time

  while (documentStatus !== "document.draft" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

    const statusResponse = await axios.get(
      `https://api.pandadoc.com/public/v1/documents/${documentId}`,
      {
        headers: {
          Authorization: `API-Key ${apiKey}`,
        },
      }
    );

    documentStatus = statusResponse.data.status;
    attempts++;
  }

  if (documentStatus !== "document.draft") {
    throw new Error("Document did not reach draft status in time");
  }

  // Step 3: Send the document
  await axios.post(
    `https://api.pandadoc.com/public/v1/documents/${documentId}/send`,
    {
      message: "Please review and sign this loan agreement",
      silent: false, // Set to true if you don't want to send emails
    },
    {
      headers: {
        Authorization: `API-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return createResponse.data;
};

export default createDocument;
