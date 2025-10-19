"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface AnalyticsData {
  TotalUsers: number;
  ActiveLoans: number;
  TotalRevenue: number;
}

interface AnalyticsResponse {
  success?: string;
  message?: string;
  statusCode?: string;
  data?: AnalyticsData;
}

export default function useAdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (token) {
        const response = await axios.get<AnalyticsResponse>(
          "/proxy/Analytics/Overview",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAnalyticsData(response.data);
      } else {
        throw new Error("Token missing in session.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  return { fetchAnalytics, analyticsData, loading, error };
}
