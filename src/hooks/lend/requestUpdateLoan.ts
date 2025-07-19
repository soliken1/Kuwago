import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export const useUpdateLoanStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateLoanStatus = async (
    loanRequestID: string,
    updatedLoanStatus: string,
    updatedLoanAmount: number,
    interestRate: number,
    termsOfMonths: number,
    paymentType: number
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const payload = {
        loanRequestID,
        updatedLoanStatus,
        updatedLoanAmount,
        interestRate,
        termsOfMonths,
        paymentType,
      };

      console.log(payload);

      const response = await axios.put("/proxy/Loan/LoanAgreement", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      return response.data.data;
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
    updateLoanStatus,
    loading,
    error,
    success,
  };
};
