"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";
interface UserData {
  uid: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  profilePicture?: string;
  role?: string;
  createdAt?: string;
}

interface UserResponse {
  success?: string;
  message?: string;
  statusCode?: string;
  data?: UserData;
}

export default function useGetLenderUsers() {
  const [lendersData, setLendersData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lenderUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (token) {
        const response = await axios.get<UserResponse>(
          "/proxy/Auth/GetSpecificUser?Role=1",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLendersData(response.data);
      } else {
        throw new Error("Token missing in login response.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return { lenderUsers, lendersData, loading, error };
}
