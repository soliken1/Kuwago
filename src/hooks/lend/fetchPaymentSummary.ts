import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export interface Payment {
  paymentID: string;
  payableID: string;
  borrowerUID: string;
  amountPaid: number;
  paymentDate: string;
  notes: string;
}

export interface PaymentSummary {
  payableID: string;
  totalPayableAmount: number;
  totalPaid: number;
  remainingBalance: number;
  isFullyPaid: boolean;
  paymentCount: number;
  payments: Payment[];
}

export const useFetchPaymentSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchPaymentSummary = async (payableID: string): Promise<PaymentSummary> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(`/proxy/Payments/summary/${payableID}`, {
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
          "Payment summary request failed.";
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
    fetchPaymentSummary,
    loading,
    error,
    success,
  };
};

