import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";
import { LoanWithUserInfo } from "@/types/lendings";

export const useFetchLenderLoans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchLenderLoans = async (
    lenderUid: string
  ): Promise<LoanWithUserInfo[]> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(`/proxy/Loan/Lender/${lenderUid}`, {
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
          (axiosError.response.data as any).message ||
          "Lender loan request failed.";
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
    fetchLenderLoans,
    loading,
    error,
    success,
  };
};

