import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export interface PaymentSuccessData {
  paymentID: string;
  frontendUrl: string;
  amountPaid: number;
  paymentDate: string;
  dueDate: string;
  status: string;
  isOnTime: boolean;
}

export interface PaymentSuccessResponse {
  success: boolean;
  message: string;
  data?: PaymentSuccessData;
}

export const usePaymentSuccess = (paymentId: string | null) => {
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentSuccess = async () => {
      if (!paymentId) return;

      setLoading(true);
      setError(null);

      try {
        const token = getCookie("session_token");

        const response = await axios.get(`/proxy/Payments/Success?paymentId=${paymentId}`, {
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

    fetchPaymentSuccess();
  }, [paymentId]);

  return {
    paymentData,
    loading,
    error,
  };
};