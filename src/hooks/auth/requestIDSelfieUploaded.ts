"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
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
  // Add other properties as needed
}

interface VerificationResponse {
  success?: string;
  message?: string;
  statusCode?: string;
  data?: UserData;
}

export default function useIDSelfieUploaded() {
  const [verificationData, setVerificationData] =
    useState<VerificationResponse | null>(null);
  const [forceVerificationModal, setForceVerificationModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const idSelfieUploaded = async () => {
    setLoading(true);

    try {
      const token = getCookie("session_token");
      if (token) {
        const verificationResponse = await axios.get<VerificationResponse>(
          "/proxy/IdentityVerification/GetIdentityLoggedInVerification",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setVerificationData(verificationResponse.data);
      } else {
        throw new Error("Token missing in login response.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      if (err.response?.status === 404) {
        setForceVerificationModal(true);
      }
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    idSelfieUploaded();
  }, []);

  return {
    idSelfieUploaded,
    verificationData,
    forceVerificationModal,
    loading,
    error,
  };
}
