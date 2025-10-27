"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { getCookie } from "cookies-next";

interface DocumentCheckResponse {
  success?: string;
  message?: string;
  statusCode?: string;
  data?: any;
}

export default function useCheckDocuments() {
  const [documentData, setDocumentData] = useState<DocumentCheckResponse | null>(null);
  const [forceDocumentModal, setForceDocumentModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkDocuments = async () => {
    setLoading(true);

    try {
      const token = getCookie("session_token");
      if (token) {
        const documentResponse = await axios.get<DocumentCheckResponse>(
          "/proxy/DocumentUpload/CheckMyDocuments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDocumentData(documentResponse.data);
      } else {
        throw new Error("Token missing in document check response.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      if (err.response?.status === 404) {
        setForceDocumentModal(true);
      }
      setError(err.response?.data?.message || err.message || "Document check failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDocuments();
  }, []);

  return {
    checkDocuments,
    documentData,
    forceDocumentModal,
    loading,
    error,
  };
}
