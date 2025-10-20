import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export interface PaymentScheduleItem {
  dueDate: string;
  paymentDate: string | null;
  amountPaid: number;
  status: "Paid" | "Unpaid" | "Advance";
}

export interface PaymentSchedule {
  payableID: string;
  borrowerUID: string;
  monthlyPayment: number;
  totalAmount: number;
  terms: number;
  schedule: PaymentScheduleItem[];
}

export const useFetchPaymentSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchPaymentSchedule = async (
    borrowerUid: string,
    payableID: string
  ): Promise<PaymentSchedule> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(
        `/proxy/Payments/schedule/${borrowerUid}/${payableID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      return response.data.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message ||
          "Payment schedule request failed.";
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
    fetchPaymentSchedule,
    loading,
    error,
    success,
  };
};

