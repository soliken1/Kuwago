"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface DisableUserRequest {
  uid: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: number;
}

interface DisableUserResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
}

export default function useDisableUser() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserStatus = async (userData: {
    uid: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
    status: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const requestBody: DisableUserRequest = {
        uid: userData.uid,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phoneNumber: userData.phoneNumber,
        status: userData.status,
      };

      const response = await axios.put<DisableUserResponse>(
        "/proxy/Auth/EditUserInfoRequest",
        requestBody,
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
      const errorMessage = err.response?.data?.message || err.message || "Failed to update user status";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const disableUser = async (userData: {
    uid: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  }) => {
    return updateUserStatus({ ...userData, status: 2 });
  };

  const approveUser = async (userData: {
    uid: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  }) => {
    return updateUserStatus({ ...userData, status: 1 });
  };

  const denyUser = async (userData: {
    uid: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  }) => {
    return updateUserStatus({ ...userData, status: 2 });
  };

  return { updateUserStatus, disableUser, approveUser, denyUser, loading, error };
}
