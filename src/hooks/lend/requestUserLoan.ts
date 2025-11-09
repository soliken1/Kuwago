import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

interface LenderInfo {
  lenderFullName: string;
  lenderProfilePicture: string | null;
  lenderTIN: string;
  interestRates: number[];
  termsOfPayment: number[];
  gracePeriod: string;
}

interface LoanData {
  loanRequestID: string;
  uid: string;
  businessTIN?: string;
  businessType?: number;
  maritalStatus?: string;
  highestEducation?: string;
  employmentInformation?: string;
  detailedAddress?: string;
  residentType?: string;
  loanType: string | number;
  loanAmount: string | number;
  loanPurpose: string;
  loanStatus: string;
  createdAt: string;
  lenderInfo?: LenderInfo;
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

export const useFetchUserLoans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getUserLoans = async (uid: string) => {
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

      setSuccess(true);
      return response.data.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message ||
          "Fetching user loans failed.";
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
    getUserLoans,
    loading,
    error,
    success,
  };
};
