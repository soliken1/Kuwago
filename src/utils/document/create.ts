import axios from "axios";
import { LoanWithUserInfo } from "@/types/lendings";

interface StoredUser {
  uid?: string;
  username?: string;
  fullName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address?: string;
}

const createDocument = async (
  selectedLoan: LoanWithUserInfo,
  storedUser: StoredUser
) => {
  const apiKey = process.env.PANDADOC_API_KEY;
  const templateId = process.env.PANDADOC_TEMPLATE_ID;

  if (!apiKey || !templateId) {
    throw new Error("PandaDoc API credentials are not configured");
  }

  const { loanInfo, userInfo } = selectedLoan;

  // Extract borrower information
  const borrowerFirstName = loanInfo.firstName || userInfo.firstName;
  const borrowerLastName = loanInfo.lastName || userInfo.lastName;

  // Calculate loan details
  const today = new Date();
  const loanAmount = loanInfo.loanAmount;
  const interestRate = loanInfo.interestRate || 0;
  const termsOfMonths = parseInt(String(loanInfo.termsofMonths || 3), 10);

  // Calculate total amount with interest
  const interestAmount = (loanAmount * interestRate) / 100;
  const totalPayableAmount = loanAmount + interestAmount;

  // Calculate monthly payment
  const monthlyPayment = totalPayableAmount / termsOfMonths;

  // Calculate due dates
  const firstDueDate = new Date(today);
  firstDueDate.setMonth(firstDueDate.getMonth() + 1);

  const lastDueDate = new Date(today);
  lastDueDate.setMonth(lastDueDate.getMonth() + termsOfMonths);

  // Convert amount to text (you may want to use a number-to-words library)
  const amountText = convertNumberToWords(loanAmount);

  // Determine payment frequency
  const paymentFrequency = "Monthly"; // Based on your termsOfMonths

  // Format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const payload = {
    name: `Loan Agreement - ${borrowerFirstName} ${borrowerLastName}`,
    template_uuid: templateId,
    recipients: [
      {
        email: storedUser.email || "",
        first_name: storedUser.firstName || storedUser.username || "Lender",
        last_name: storedUser.lastName || "",
        company: storedUser.company || "",
        street_address: storedUser.address || "",
        role: "Lender",
        signing_order: 1,
      },
      {
        email: userInfo.email,
        first_name: borrowerFirstName,
        last_name: borrowerLastName,
        company: userInfo.company || "",
        street_address: userInfo.address || "",
        role: "Borrower",
        signing_order: 2,
      },
      {
        email: "solitudebaruch@gmail.com",
        first_name: "Kenneth James",
        last_name: "Macas",
        company: "The Kuwago Team",
        street_address: "6000 Gov. M. Cuenco Ave, Cebu City, 6000 Cebu",
        role: "Admin",
        signing_order: 3,
      },
    ],
    tokens: [
      // Lender tokens
      {
        name: "Lender.FirstName",
        value: storedUser.firstName || storedUser.username || "Lender",
      },
      {
        name: "Lender.LastName",
        value: storedUser.lastName || "",
      },
      {
        name: "Lender.Email",
        value: storedUser.email || "",
      },
      {
        name: "Lender.Company",
        value: storedUser.company || "",
      },
      {
        name: "Lender.StreetAddress",
        value: storedUser.address || "",
      },
      {
        name: "Lender.Day",
        value: today.getDate().toString(),
      },
      {
        name: "Lender.Month",
        value: today.toLocaleDateString("en-US", { month: "long" }),
      },
      {
        name: "Lender.Year",
        value: today.getFullYear().toString(),
      },
      // Borrower tokens
      {
        name: "Borrower.FirstName",
        value: borrowerFirstName,
      },
      {
        name: "Borrower.LastName",
        value: borrowerLastName,
      },
      {
        name: "Borrower.Email",
        value: userInfo.email,
      },
      {
        name: "Borrower.Company",
        value: userInfo.company || "",
      },
      {
        name: "Borrower.StreetAddress",
        value: userInfo.address || "",
      },
      {
        name: "Borrower.AmountText",
        value: amountText,
      },
      {
        name: "Borrower.Amount",
        value: loanAmount.toLocaleString(),
      },
      {
        name: "Borrower.Interest",
        value: interestRate.toString(),
      },
      {
        name: "Borrrower.MonthlyAmount",
        value: `₱${monthlyPayment.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      },
      {
        name: "Borrower.Frequency",
        value: paymentFrequency,
      },
      {
        name: "Borrower.FirstDue",
        value: formatDate(firstDueDate),
      },
      {
        name: "Borrower.LastDue",
        value: formatDate(lastDueDate),
      },
      {
        name: "Borrower.Penalty",
        value: "5%",
      },
      {
        name: "Borrower.InterestIncrese",
        value: "1%",
      },
      // Admin tokens
      {
        name: "Admin.FirstName",
        value: "Kenneth James",
      },
      {
        name: "Admin.LastName",
        value: "Macas",
      },
      {
        name: "Admin.Company",
        value: "The Kuwago Team",
      },
    ],
    fields: {
      borrower_signature: {
        value: "",
      },
      lender_signature: {
        value: "",
      },
      admin_signature: {
        value: "",
      },
    },
    metadata: {
      loanRequestID: loanInfo.loanRequestID,
      loanAmount: loanAmount.toString(),
      loanType: loanInfo.loanType.toString(),
      loanPurpose: loanInfo.loanPurpose,
      borrowerUID: userInfo.uid,
      lenderUID: storedUser.uid || "",
      interestRate: interestRate.toString(),
      termsOfMonths: termsOfMonths.toString(),
      paymentType: loanInfo.paymentType?.toString() || "1",
    },
  };

  try {
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
    console.log(`Document created with ID: ${documentId}`);

    // Step 2: Wait for document to be in 'document.draft' status
    let documentStatus = "";
    let attempts = 0;
    const maxAttempts = 30;

    while (documentStatus !== "document.draft" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      if (documentStatus === "document.draft") {
        console.log("Document is ready to send");
        break;
      }
    }

    if (documentStatus !== "document.draft") {
      throw new Error(
        `Document did not reach draft status in time. Current status: ${documentStatus}`
      );
    }

    // Step 3: Send the document
    await axios.post(
      `https://api.pandadoc.com/public/v1/documents/${documentId}/send`,
      {
        message: `Dear ${borrowerFirstName}, please review and sign this loan agreement for ₱${loanAmount.toLocaleString()}.`,
        silent: false,
      },
      {
        headers: {
          Authorization: `API-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Document sent successfully");
    return createResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PandaDoc API Error:", error.response?.data);
      throw new Error(
        `PandaDoc Error: ${error.response?.data?.detail || error.message}`
      );
    }
    throw error;
  }
};

// Helper function to convert number to words (basic implementation)
function convertNumberToWords(num: number): string {
  // This is a simplified version - consider using a library like 'number-to-words' for production
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  if (num === 0) return "Zero";

  let words = "";

  if (num >= 1000000) {
    words += convertNumberToWords(Math.floor(num / 1000000)) + " Million ";
    num %= 1000000;
  }

  if (num >= 1000) {
    words += convertNumberToWords(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }

  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }

  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }

  if (num >= 10) {
    words += teens[num - 10] + " ";
    return words.trim();
  }

  if (num > 0) {
    words += ones[num] + " ";
  }

  return words.trim() + " Pesos";
}

// Helper function to get loan type label
function getLoanTypeLabel(loanType: number | string): string {
  const typeMap: { [key: string]: string } = {
    "1": "Personal Loan",
    "2": "Business Loan",
    "3": "Emergency Loan",
    "4": "Education Loan",
  };
  return typeMap[loanType.toString()] || "Unknown";
}

// Helper function to get business type label
function getBusinessTypeLabel(businessType: number | string): string {
  const typeMap: { [key: string]: string } = {
    "1": "Sole Proprietorship",
    "2": "Partnership",
    "3": "Corporation",
    "4": "Cooperative",
  };
  return typeMap[businessType.toString()] || "Unknown";
}

export default createDocument;
