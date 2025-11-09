"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next";

export interface CreditScoreData {
  uid: string;
  score: number;
  totalLoans: number;
  successfulRepayments: number;
  missedRepayments: number;
  lastUpdated: string;
}

export interface CreditScoreCategoryData {
  uid: string;
  score: number;
  category: string;
}

export interface AIAssessmentData {
  borrowerUID: string;
  aiSuggestion: string[];
}

interface CreditScoreResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: CreditScoreData;
}

interface CreditScoreCategoryResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: CreditScoreCategoryData;
}

interface AIAssessmentResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: AIAssessmentData;
}

export default function useCreditScore() {
  const [creditScoreData, setCreditScoreData] = useState<CreditScoreData | null>(null);
  const [creditScoreCategory, setCreditScoreCategory] = useState<CreditScoreCategoryData | null>(null);
  const [aiAssessment, setAiAssessment] = useState<AIAssessmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditScore = async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) {
        throw new Error("Token missing in session.");
      }

      // Fetch credit score data and category in parallel (no AI assessment on initial load)
      const [scoreResponse, categoryResponse] = await Promise.all([
        axios.get<CreditScoreResponse>(
          `/proxy/Score/GetCreditScore/${uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        axios.get<CreditScoreCategoryResponse>(
          `/proxy/Score/GetCreditScoreCategory/${uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      ]);

      if (scoreResponse.data && scoreResponse.data.data) {
        setCreditScoreData(scoreResponse.data.data);
      }

      if (categoryResponse.data && categoryResponse.data.data) {
        setCreditScoreCategory(categoryResponse.data.data);
      }

      return {
        scoreData: scoreResponse.data?.data,
        categoryData: categoryResponse.data?.data
      };
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Failed to fetch credit score");
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAssessment = async (uid: string) => {
    setAiLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) {
        throw new Error("Token missing in session.");
      }

      const aiResponse = await axios.get<AIAssessmentResponse>(
        `/proxy/AIAssessment/ImprovedScore/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (aiResponse.data && aiResponse.data.data) {
        setAiAssessment(aiResponse.data.data);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Failed to fetch AI assessment");
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  return { 
    fetchCreditScore, 
    fetchAIAssessment,
    creditScoreData, 
    creditScoreCategory, 
    aiAssessment, 
    loading, 
    aiLoading,
    error 
  };
}
