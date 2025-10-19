import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export interface PaymentRequest {
  payableID: string;
  borrowerUID: string;
  amountPaid: number;
  paymentDate: string;
  notes: string;
  paymentType: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    paymentID: string;
    payableID: string;
    borrowerUID: string;
    amountPaid: number;
    paymentDate: string;
    notes: string;
    paymentType: string;
  };
}

export const useRequestPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitPayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.post("/proxy/Payments", paymentData, {
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
          (axiosError.response.data as any).message ||
          "Payment submission failed.";
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
    submitPayment,
    loading,
    error,
    success,
  };
};
