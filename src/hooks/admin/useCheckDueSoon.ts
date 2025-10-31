"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";
import { DueSoonResponse, DueSoonData } from "@/types/payments";

export default function useCheckDueSoon() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchDueSoon = async (): Promise<DueSoonData[]> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");
      const response = await axios.get("/proxy/Payments/due-soon", {
        headers: {
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
          "All Loan request failed.";
        setError(message);
      } else {
        setError(axiosError.message);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchDueSoon, loading, error, success };
}
