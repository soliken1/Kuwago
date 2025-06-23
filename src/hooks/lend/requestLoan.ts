import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

interface LoanFormData {
  maritalStatus: number;
  highestEducation: number;
  employmentInformation: string;
  detailedAddress: string;
  residentType: number;
  loanType: number;
  loanAmount: number;
  loanPurpose: string;
}

export const useSubmitLoanRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitLoanRequest = async (formData: LoanFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.post("/proxy/Loan/LoanRequest", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      return response.data.data.loanInfo.loanRequestID;
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
    submitLoanRequest,
    loading,
    error,
    success,
  };
};
