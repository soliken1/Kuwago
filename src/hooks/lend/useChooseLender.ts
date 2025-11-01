import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

interface ChooseLenderPayload {
  lenderUid: string;
  loanRequestId: string;
}

export const useChooseLender = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const chooseLender = async (payload: ChooseLenderPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.post("/proxy/Loan/Choose-Lender", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message || "Failed to choose lender.";
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
    chooseLender,
    loading,
    error,
    success,
  };
};

