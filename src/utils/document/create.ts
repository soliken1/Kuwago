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
  const apiKey = process.env.NEXT_PUBLIC_PANDADOC_API_KEY;
  const templateId = process.env.NEXT_PUBLIC_PANDADOC_TEMPLATE_ID;

  if (!apiKey || !templateId) {
    throw new Error("PandaDoc API credentials are not configured");
  }

  // Use firstName/lastName from userInfo as fallback if not in loanInfo
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

  return response.data;
};

export default createDocument;
