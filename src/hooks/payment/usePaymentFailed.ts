import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export interface PaymentFailedData {
  paymentID: string;
  frontendUrl: string;
  amountPaid: number;
  paymentDate: string;
  dueDate: string;
  status: string;
  isOnTime: boolean;
  errorMessage?: string;
  failureReason?: string;
}

export interface PaymentFailedResponse {
  success: boolean;
  message: string;
  data?: PaymentFailedData;
}

export const usePaymentFailed = (paymentId: string | null) => {
  const [paymentData, setPaymentData] = useState<PaymentFailedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentFailed = async () => {
      if (!paymentId) return;

      setLoading(true);
      setError(null);

      try {
        const token = getCookie("session_token");

        const response = await axios.get(`/proxy/Payments/Failed?paymentId=${paymentId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.data) {
          setPaymentData(response.data.data);
        }
      } catch (err) {
        const axiosError = err as AxiosError;

        if (axiosError.response && axiosError.response.data) {
          const message =
            (axiosError.response.data as any).message ||
            "Failed to fetch payment details.";
          setError(message);
        } else {
          setError(axiosError.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentFailed();
  }, [paymentId]);

  return {
    paymentData,
    loading,
    error,
  };
};
