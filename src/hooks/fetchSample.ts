"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

interface Sample {
  name: string;
  role: string;
}

function useSample() {
  const [data, setData] = useState<Sample | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSample = async () => {
      try {
        const response = await axios.get<Sample>(
          "/proxy/sample/dr94pyNBCdMxkPnlsgrn"
        );
        setData(response.data);
      } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>;
        setError(
          err.response?.data?.message || err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSample();
  }, []);

  return { data, loading, error };
}

export default useSample;
