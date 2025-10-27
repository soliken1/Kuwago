"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface FaceVerifyResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    confidence: number;
    verifyStatus: number;
  };
}

export default function useFaceVerifyRequest() {
  const [faceVerifyData, setFaceVerifyData] = useState<FaceVerifyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const faceVerify = async (onSuccess?: (data: FaceVerifyResponse) => void) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      if (token) {
        const response = await axios.post<FaceVerifyResponse>(
          "/proxy/IdentityVerification/VerifyFaceMatch",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        setFaceVerifyData(response.data);
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        throw new Error("Token missing in face verification request.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Face verification failed");
    } finally {
      setLoading(false);
    }
  };

  return { faceVerify, faceVerifyData, loading, error };
}
