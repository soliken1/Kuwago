"use client";
import axios, { AxiosError } from "axios";
import { useState, useCallback } from "react";
import { getCookie } from "cookies-next";

interface UserDocument {
  status: number;
  documentUrls: string[];
  uploadedAt: any;
  uid: string;
  remarks: string;
  reviewedByUID: string | null;
  updatedAt: any;
  uploadedAtDate: string;
  updatedAtDate: string;
}

interface UserDocumentsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: UserDocument[];
}

export default function useUserDocuments() {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDocuments = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get<UserDocumentsResponse>(
        "/proxy/DocumentUpload/GetUserDocuments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        // Filter documents by the provided uid
        const filteredDocuments = response.data.data.filter(doc => doc.uid === uid);
        setUserDocuments(filteredDocuments);
      } else {
        setUserDocuments([]);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Failed to fetch user documents");
      setUserDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { userDocuments, loading, error, fetchUserDocuments };
}
