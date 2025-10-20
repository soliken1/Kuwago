"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface UserGrowthData {
  period: string;
  count: number;
}

interface UserGrowthResponse {
  success?: boolean;
  message?: string;
  statusCode?: string;
  data?: UserGrowthData[];
}

type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

export default function useUserGrowth() {
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserGrowth = async (period: PeriodType = "monthly") => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (token) {
        const response = await axios.get<UserGrowthResponse>(
          `/proxy/Analytics/UserGrowth?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserGrowthData(response.data);
      } else {
        throw new Error("Token missing in session.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Failed to fetch user growth data");
    } finally {
      setLoading(false);
    }
  };

  return { fetchUserGrowth, userGrowthData, loading, error };
}
