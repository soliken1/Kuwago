"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

export interface CreateLenderDetailsPayload {
  principalAmount: number;
  termsOfPayment: number[];
  interestRates: number[];
  subscriptionType: number;
  gracePeriod: number;
  lenderTIN: string;
}

interface CreateLenderDetailsResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: any;
}

export default function useCreateLenderDetails() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createLenderDetails = async (
    payload: CreateLenderDetailsPayload
  ): Promise<CreateLenderDetailsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) {
        throw new Error("Token missing in login response.");
      }

      const response = await axios.post<CreateLenderDetailsResponse>(
        "/proxy/LenderInfo/Create-Lender-Details",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create lender details";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createLenderDetails, loading, error };
}

