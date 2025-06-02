"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";
interface IDSelfieUploadPayload {
  idPhoto: string;
  selfiePhoto: string;
}

interface IDSelfieUploadResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: string;
}

export default function useIDSelfieUploadRequest() {
  const [idSelfieData, setIDSelfieData] =
    useState<IDSelfieUploadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const idSelfieUpload = async (
    payload: IDSelfieUploadPayload,
    onSuccess?: () => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      if (token) {
        const response = await axios.post<IDSelfieUploadResponse>(
          "/proxy/IdentityVerification/UploadIDAndSelfie",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            payload,
          }
        );

        setIDSelfieData(response.data);

        onSuccess?.();
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

  return { idSelfieUpload, idSelfieData, loading, error };
}
