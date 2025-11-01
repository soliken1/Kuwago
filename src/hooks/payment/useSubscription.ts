import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import axios, { AxiosError } from "axios";

// ==========================================
// Types
// ==========================================

export interface PlanDetails {
  planType: string;
  name: string;
  amount: number;
  durationMonths: number;
  currency: string;
  description: string;
}

export interface SubscriptionCheckoutData {
  subscriptionID: string;
  checkoutUrl: string;
  planType: string;
  amount: number;
  durationMonths: number;
  status: string;
}

export interface LenderSubscriptionData {
  lenderUID: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: any;
}

// ==========================================
// Hook: Create Subscription Checkout
// ==========================================

export const useSubscriptionCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] =
    useState<SubscriptionCheckoutData | null>(null);

  const createCheckout = async (
    lenderUID: string,
    name: string,
    planType: string
  ): Promise<SubscriptionResponse> => {
    setLoading(true);
    setError(null);
    setCheckoutData(null);

    try {
      const token = getCookie("session_token");

      const response = await axios.post(
        `/proxy/Subscription/checkout`,
        {
          lenderUID,
          name,
          planType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCheckoutData(response.data.data);

        // Redirect to checkout URL
        if (response.data.data.checkoutUrl) {
          window.location.href = response.data.data.checkoutUrl;
        }
      } else {
        setError(response.data.message);
      }

      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message ||
          "Failed to create subscription checkout.";
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
    checkoutData,
    loading,
    error,
    createCheckout,
  };
};

// ==========================================
// Hook: Get Lender Subscription
// ==========================================

export const useGetLenderSubscription = (lenderUID: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] =
    useState<LenderSubscriptionData | null>(null);

  const fetchSubscription = async (
    uid: string
  ): Promise<SubscriptionResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(`/proxy/Subscription/lender/${uid}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSubscription(response.data.data);
      } else {
        setError(response.data.message);
      }

      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message ||
          "Failed to fetch subscription.";
        setError(message);
      } else {
        setError(axiosError.message);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lenderUID) {
      fetchSubscription(lenderUID);
    }
  }, [lenderUID]);

  return {
    subscription,
    loading,
    error,
    refetch: () => lenderUID && fetchSubscription(lenderUID),
  };
};

// ==========================================
// Hook: Check Subscription Active
// ==========================================

export const useCheckSubscriptionActive = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const checkActive = async (
    lenderUID: string
  ): Promise<SubscriptionResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(
        `/proxy/Subscription/check-active/${lenderUID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsActive(response.data.data.isActive);
      } else {
        setError(response.data.message);
      }

      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message ||
          "Failed to check subscription status.";
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
    isActive,
    loading,
    error,
    checkActive,
  };
};

// ==========================================
// Hook: Get Available Plans
// ==========================================

export const useGetAvailablePlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanDetails[]>([]);

  const fetchPlans = async (): Promise<SubscriptionResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/proxy/Subscription/plans`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setPlans(response.data.data);
      } else {
        setError(response.data.message);
      }

      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message || "Failed to fetch plans.";
        setError(message);
      } else {
        setError(axiosError.message);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
};

// ==========================================
// Hook: Get Subscription History
// ==========================================

export const useGetSubscriptionHistory = (lenderUID: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async (uid: string): Promise<SubscriptionResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");

      const response = await axios.get(`/proxy/Subscription/history/${uid}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setHistory(response.data.data);
      } else {
        setError(response.data.message);
      }

      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const message =
          (axiosError.response.data as any).message ||
          "Failed to fetch subscription history.";
        setError(message);
      } else {
        setError(axiosError.message);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lenderUID) {
      fetchHistory(lenderUID);
    }
  }, [lenderUID]);

  return {
    history,
    loading,
    error,
    refetch: () => lenderUID && fetchHistory(lenderUID),
  };
};
