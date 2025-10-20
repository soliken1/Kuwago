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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);

  const fetchPaymentSuccess = async (id: string): Promise<PaymentSuccessResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(`/proxy/Payments/Success?paymentId=${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setPaymentData(response.data.data);
      return response.data;
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

      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentId) {
      fetchPaymentSuccess(paymentId);
    }
  }, [paymentId]);

  return {
    paymentData,
    loading,
    error,
    fetchPaymentSuccess,
  };
};
