import { useState } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

export interface AIAssessmentData {
  borrowerUID: string;
  riskLevel: "Low" | "Medium" | "High";
  recommendation: string;
  reasoning: string[];
}

export interface AIAssessmentResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: AIAssessmentData;
}

export const useFetchAIAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchAIAssessment = async (uid: string): Promise<AIAssessmentData> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getCookie("session_token");

      const response = await axios.get<AIAssessmentResponse>(
        `/proxy/AIAssessment/LoanAssessment/${uid}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      return response.data.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message ||
          "AI Assessment request failed.";
        setError(message);
      } else {
        setError(axiosError.message);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchAIAssessment,
    loading,
    error,
    success,
  };
};

