"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface RevenueTrendData {
  period: string;
  revenue: number;
}

interface UserTrendData {
  period: string;
  totalUsers: number;
}

interface LenderKPIData {
  TotalUsers: number;
  TotalRevenue: number;
  RevenueTrend: RevenueTrendData[];
  UserTrend: UserTrendData[];
}

interface LenderKPIResponse {
  success?: boolean;
  message?: string;
  statusCode?: string;
  data?: LenderKPIData;
}

type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

export default function useLenderKPI() {
  const [kpiData, setKpiData] = useState<LenderKPIData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLenderKPI = async (lenderUid: string, period: PeriodType = "monthly") => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (token) {
        const response = await axios.get<LenderKPIResponse | LenderKPIData>(
          `/proxy/Analytics/LenderKPI/${lenderUid}?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Handle both response structures: wrapped in data property or direct
        const responseData = response.data;
        if ('data' in responseData && responseData.data) {
          // Wrapped response structure
          setKpiData(responseData.data);
        } else if ('TotalUsers' in responseData && 'TotalRevenue' in responseData) {
          // Direct LenderKPIData structure (API returns data directly)
          setKpiData(responseData as LenderKPIData);
        } else {
          setKpiData(null);
        }
      } else {
        throw new Error("Token missing in session.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Failed to fetch lender KPI data");
    } finally {
      setLoading(false);
    }
  };

  return { fetchLenderKPI, kpiData, loading, error };
}

