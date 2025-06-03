"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface IDSelfieUploadResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: string;
}

export default function useIDSelfieUploadRequest() {
  useState<IDSelfieUploadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const idSelfieUpload = async (formData: FormData, onSuccess: () => void) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      if (token) {
        await axios.post(
          "/proxy/IdentityVerification/UploadIDAndSelfie",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        onSuccess();
      } else {
        throw new Error("Token missing in upload response.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return { idSelfieUpload, loading, error };
}
