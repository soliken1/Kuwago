"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";
export interface UserData {
  uid: string;
  fullName?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  phoneNumber?: string;
  username?: string;
  profilePicture?: string;
  role?: string;
  createdAt?: string;
  status?: string;
  lenderInstitution?: string;
  lenderAddress?: string;
  businessName?: string | null;
  businessAddress?: string | null;
}

interface UserResponse {
  success?: string;
  message?: string;
  statusCode?: string;
  data?: UserData[];
}

export default function useGetAllUsers() {
  const [allUsersData, setAllUsersData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const allUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (token) {
        const response = await axios.get<UserResponse>(
          "/proxy/Auth/GetAllUser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAllUsersData(response.data);
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

  return { allUsers, allUsersData, loading, error };
}
