"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

export default function useMarkNotified() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const markNotified = async (payableId: string, paymentDueDate: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");
      const response = await axios.post(
        `/proxy/Payments/mark-notified/${payableId}?paymentDueDate=${paymentDueDate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const message =
        (axiosError.response?.data as any)?.message ||
        axiosError.message ||
        "Marking as notified failed.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { markNotified, loading, error, success };
}
