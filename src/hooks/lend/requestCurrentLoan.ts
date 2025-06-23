import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

interface LoanData {
  loanRequestID: string;
  uid: string;
  maritalStatus: string;
  highestEducation: string;
  employmentInformation: string;
  detailedAddress: string;
  residentType: string;
  loanType: string;
  loanAmount: number;
  loanPurpose: string;
  loanStatus: string;
  createdAt: string;
  // ... Add more fields if needed
}

interface LoanResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: {
    userInfo?: any;
    loans?: LoanData[];
  };
}

export const useFetchLoanRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getLoanRequest = async (uid: string, currentLoanId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.get<LoanResponse>(
        `/proxy/Loan/LoanRequests/${uid}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const loanList = response.data.data?.loans || [];

      const matchedLoan = loanList.find(
        (loan) => loan.loanRequestID === currentLoanId
      );

      if (!matchedLoan) {
        throw new Error("No matching loan request found.");
      }

      setSuccess(true);
      return matchedLoan;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message || "Loan request failed.";
        setError(message);
      } else {
        setError(axiosError.message);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getLoanRequest,
    loading,
    error,
    success,
  };
};
