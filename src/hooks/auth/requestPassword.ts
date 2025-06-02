"use client";
import { useState } from "react";
import axios, { AxiosError } from "axios";
interface PasswordPayload {
  email: string;
}

interface PasswordResponse {
  success?: boolean;
  message?: string;
  statusCode?: Int32Array;
  data?: null;
}

export default function usePasswordRequest() {
  const [passwordData, setPasswordData] = useState<PasswordResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (
    payload: PasswordPayload,
    onSuccess?: () => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const PasswordResponse = await axios.post<PasswordResponse>(
        "/proxy/Auth/ForgotPassword",
        payload
      );
      setPasswordData(PasswordResponse.data);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, passwordData, loading, error };
}
