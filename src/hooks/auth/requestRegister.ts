"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";

interface UserData {
  uid: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  profilePicture?: string;
  role?: string;
  createdAt?: string;
  // Add other properties as needed
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  role: number;
}

interface RegisterResponse {
  token?: string;
  message?: string;
  errors?: Record<string, string[]>;
  data?: UserData;
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
      const err = error as AxiosError<RegisterResponse>;
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        setError(errorMessages);
      } else {
        setError(
          err.response?.data?.message || err.message || "Registration failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return { register, registerData, loading, error };
}
