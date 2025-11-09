"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

export interface BorrowerPastDue {
  borrowerFullName: string;
  businessName: string;
  paymentPerMonth: number;
  overdueSchedules: string[];
}

interface BorrowerPastDuesResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: BorrowerPastDue[];
}

export default function useBorrowerPastDues() {
  const [pastDuesData, setPastDuesData] = useState<BorrowerPastDue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBorrowerPastDues = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) {
        throw new Error("Token missing in session.");
      }

      const response = await axios.get<BorrowerPastDuesResponse>(
        `/proxy/Analytics/BorrowerPastDues`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle both response structures: wrapped in data property or direct
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        // Wrapped response structure
        setPastDuesData(responseData.data);
      } else if (Array.isArray(responseData)) {
        // Direct array structure (API returns data directly)
        setPastDuesData(responseData as BorrowerPastDue[]);
      } else {
        setPastDuesData([]);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Failed to fetch borrower past dues");
      setPastDuesData([]);
    } finally {
      setLoading(false);
    }
  };

  return { fetchBorrowerPastDues, pastDuesData, loading, error };
}

