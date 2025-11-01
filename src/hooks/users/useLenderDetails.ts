"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface LenderDetails {
  uid: string;
  principalAmount?: number;
  subscriptionType?: number;
  gracePeriod?: number;
  lenderTIN?: string;
  lenderInstitution?: string;
  lenderAddress?: string;
  createdAt?: string;
}

interface LenderDetailsResponse {
  success?: string;
  message?: string;
  statusCode?: string;
  data?: LenderDetails;
}

export default function useGetLenderDetails() {
  const [lendersData, setLendersData] = useState<LenderDetailsResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lenderUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (token) {
        const response = await axios.get<LenderDetailsResponse>(
          "/proxy/LenderInfo/Get-Lender-Details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLendersData(response.data);

        localStorage.setItem("lenderDetails", JSON.stringify(lendersData));
      } else {
        throw new Error("Token missing in login response.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch lender details"
      );
    } finally {
      setLoading(false);
    }
  };

  return { lenderUsers, lendersData, loading, error };
}
