import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export const useFetchAllLoans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchAllLoans = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.get("/proxy/Loan/AllLoans", {
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
          "All Loan request failed.";
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
    fetchAllLoans,
    loading,
    error,
    success,
  };
};
