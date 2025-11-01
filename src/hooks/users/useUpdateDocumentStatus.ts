"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface UpdateDocumentStatusRequest {
  uid: string;
  status: number;
  remarks: string;
}

interface UpdateDocumentStatusResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: any;
}

export default function useUpdateDocumentStatus() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateDocumentStatus = async (request: UpdateDocumentStatusRequest) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post<UpdateDocumentStatusResponse>(
        "/proxy/DocumentUpload/UpdateDocumentStatus",
        request,
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
      const errorMessage = err.response?.data?.message || err.message || "Failed to update document status";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const approveDocuments = async (uid: string) => {
    const remarks = `Documents have been reviewed and approved by administrator on ${new Date().toLocaleString()}`;
    return updateDocumentStatus({
      uid,
      status: 1, // approved
      remarks,
    });
  };

  const denyDocuments = async (uid: string) => {
    const remarks = `Documents have been denied by administrator after review on ${new Date().toLocaleString()}`;
    return updateDocumentStatus({
      uid,
      status: 2, // denied
      remarks,
    });
  };

  const disableDocuments = async (uid: string) => {
    const remarks = `Account has been disabled by administrator on ${new Date().toLocaleString()}`;
    return updateDocumentStatus({
      uid,
      status: 2, // disabled
      remarks,
    });
  };

  return {
    updateDocumentStatus,
    approveDocuments,
    denyDocuments,
    disableDocuments,
    loading,
    error,
  };
}

