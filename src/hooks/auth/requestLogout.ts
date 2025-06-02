"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import { getCookie } from "cookies-next";
interface LogoutResponse {
  // Update this based on actual API response structure
  message?: string;
}

export default function useLogoutRequest() {
  const [logoutData, setLogoutData] = useState<LogoutResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      console.log(token);
      if (token) {
        const response = await axios.post<LogoutResponse>(
          "/proxy/Auth/logout",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLogoutData(response.data);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return { logout, logoutData, loading, error };
}
