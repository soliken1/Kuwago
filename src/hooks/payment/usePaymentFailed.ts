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
}

export interface PaymentFailedResponse {
  success: boolean;
  message: string;
  data?: PaymentFailedData;
}

export const usePaymentSuccess = (paymentId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFailedData | null>(
    null
  );

  const fetchPaymentFailed = async (
    id: string
  ): Promise<PaymentFailedResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(
        `/proxy/Payments/Failed?paymentId=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      fetchPaymentFailed(paymentId);
    }
  }, [paymentId]);

  return {
    paymentData,
    loading,
    error,
    fetchPaymentFailed,
  };
};
