"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface RevenueTrendData {
  period: string;
  revenue: number;
}

interface RevenueTrendResponse {
  success?: boolean;
  message?: string;
  statusCode?: string;
  data?: RevenueTrendData[];
}

type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

export default function useRevenueTrend() {
  const [revenueTrendData, setRevenueTrendData] = useState<RevenueTrendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueTrend = async (period: PeriodType = "monthly") => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (token) {
        const response = await axios.get<RevenueTrendResponse>(
          `/proxy/Analytics/RevenueTrend?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRevenueTrendData(response.data);
      } else {
        throw new Error("Token missing in session.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Failed to fetch revenue trend data");
    } finally {
      setLoading(false);
    }
  };

  return { fetchRevenueTrend, revenueTrendData, loading, error };
}
