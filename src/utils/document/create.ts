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
  lastDueDate.setMonth(lastDueDate.getMonth());

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
        email: userInfo.email,
        first_name: borrowerFirstName,
        last_name: borrowerLastName,
        role: "Borrower",
        signing_order: 1,
      },
      {
        email: storedUser.email || "",
        first_name: storedUser.firstName || storedUser.username || "Lender",
        last_name: storedUser.lastName || "",
        role: "Lender",
        signing_order: 2,
      },
      {
        email: "kennethrex456@gmail.com",
        first_name: "Kenneth James",
        last_name: "Macas",
        role: "Admin",
        signing_order: 3,
      },
    ],
    tokens: [
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
    ],
    fields: {
      // You can add form fields here if your template requires them
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
    variables: {
      // Loan date information
      "Loan.Day": today.getDate().toString(),
      "Loan.Month": today.toLocaleDateString("en-US", { month: "long" }),
      "Loan.Year": today.getFullYear().toString(),
      "Loan.Date": formatDate(today),

      // Loan amount details
      "Loan.Amount": `₱${loanAmount.toLocaleString()}`,
      "Loan.AmountText": amountText,
      "Loan.AmountNumeric": loanAmount.toString(),

      // Interest and payment details
      "Loan.Interest": `${interestRate}%`,
      "Loan.InterestRate": interestRate.toString(),
      "Loan.InterestAmount": `₱${interestAmount.toLocaleString()}`,
      "Loan.TotalPayable": `₱${totalPayableAmount.toLocaleString()}`,
      "Loan.MonthlyAmount": `₱${monthlyPayment.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      "Loan.MonthlyPayment": monthlyPayment.toFixed(2),

      // Terms and schedule
      "Loan.Terms": termsOfMonths.toString(),
      "Loan.TermsText": termsOfMonths,
      "Loan.Frequency": paymentFrequency,
      "Loan.FirstDue": formatDate(firstDueDate),
      "Loan.LastDue": formatDate(lastDueDate),

      // Penalty information (you can adjust these based on your business rules)
      "Loan.Penalty": "5%", // Default penalty rate
      "Loan.PenaltyAmount": `₱${(monthlyPayment * 0.05).toLocaleString()}`,
      "Loan.InterestIncrease": "1%", // Additional interest for late payment

      // Loan purpose and type
      "Loan.Purpose": loanInfo.loanPurpose,
      "Loan.Type": getLoanTypeLabel(loanInfo.loanType),
      "Loan.BusinessType": loanInfo.businessType
        ? getBusinessTypeLabel(loanInfo.businessType)
        : "N/A",
      "Loan.BusinessTIN": loanInfo.businessTIN || "N/A",

      // Payment type
      "Loan.PaymentMethod": "E-Cash",
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
