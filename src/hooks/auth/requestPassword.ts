"use client";
import { useState } from "react";
import axios, { AxiosError } from "axios";
interface PasswordPayload {
  email: string;
}

interface PasswordResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: any;
}

export default function usePasswordRequest() {
  const [passwordData, setPasswordData] = useState<PasswordResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (
    payload: PasswordPayload,
    onSuccess?: (data: PasswordResponse) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<PasswordResponse>(
        "/proxy/Auth/forgotPassword",
        payload
      );
      setPasswordData(response.data);
      if (onSuccess) onSuccess(response.data);
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, passwordData, loading, error };
}
