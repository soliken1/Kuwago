import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export interface PaymentDetailsData {
  paymentId: string;
  amountPaid: number;
  paymentDate: string;
  dueDate: string;
  status: string;
  isOnTime: boolean;
}

export interface PaymentDetailsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: PaymentDetailsData;
}

export const usePaymentDetails = (paymentId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentDetailsData | null>(
    null
  );

  const fetchPaymentDetails = async (
    paymentId: string
  ): Promise<PaymentDetailsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(`/proxy/Payments/Details/${paymentId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPaymentData(response.data.data);
      } else {
        setError(response.data.message);
      }

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
      fetchPaymentDetails(paymentId);
    }
  }, [paymentId]);

  return {
    paymentData,
    loading,
    error,
    fetchPaymentDetails,
    refetch: () => paymentId && fetchPaymentDetails(paymentId),
  };
};
