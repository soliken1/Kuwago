"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
}

interface RegisterResponse {
  token?: string;
  message?: string;
}

export default function useRegisterRequest() {
  const [registerData, setRegisterData] = useState<RegisterResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (payload: RegisterPayload, onSuccess?: () => void) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<RegisterResponse>(
        "/proxy/Auth/register",
        payload
      );
      setRegisterData(response.data);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return { register, registerData, loading, error };
}
