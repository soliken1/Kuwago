"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

interface DocumentUploadResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: any; // Adjust based on actual API response structure
}

export default function useDocumentUploadRequest() {
  const [uploadData, setUploadData] = useState<DocumentUploadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocuments = async (documents: File[], onSuccess?: (data: DocumentUploadResponse) => void) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      if (token) {
        const formData = new FormData();
        
        // Append each document to the form data
        documents.forEach((document, index) => {
          formData.append(`documents`, document);
        });

        const response = await axios.post<DocumentUploadResponse>(
          "/proxy/DocumentUpload/BatchUpload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        
        setUploadData(response.data);
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        throw new Error("Token missing in document upload request.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Document upload failed");
    } finally {
      setLoading(false);
    }
  };

  return { uploadDocuments, uploadData, loading, error };
}
