"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface DisableUserAccountResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: any;
}

export default function useDisableUserAccount() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const disableUserAccount = async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put<DisableUserAccountResponse>(
        `/proxy/Auth/disable/${uid}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage = err.response?.data?.message || err.message || "Failed to disable user account";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    disableUserAccount,
    loading,
    error,
  };
}

