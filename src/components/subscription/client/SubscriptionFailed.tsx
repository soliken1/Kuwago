"use client";
import React, { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getCookie } from "cookies-next";
import failedPayment from "@/utils/FailedPayment";

interface SubscriptionDetails {
  subscriptionID: string;
  lenderUID: string;
  planType: string;
  amount: number;
  status: string;
  createdAt?: string;
}

function SubscriptionFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");

  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!subscriptionId) {
        setError("Subscription ID not found");
        setLoading(false);
        return;
      }

      try {
        const token = getCookie("session_token");
        const response = await axios.get(
          `/proxy/Subscription/details/${subscriptionId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setSubscriptionData(response.data.data);

          // Send failure notification email
          if (response.data.data.status === "Cancelled") {
            const user = localStorage.getItem("user");
            if (user) {
              failedPayment(
                "kennethrex456@gmail.com",
                "Admin",
                window.location.href,
                "Payment Successful"
              );
            }
          }
        } else {
          setError(response.data.message);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch subscription details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [subscriptionId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleRetrySubscription = () => {
    // Redirect to subscription page to try again
    router.push("/subscription");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Failed Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-pulse">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Failed Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2 poppins-bold">
          Subscription Payment Failed
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-6 poppins-normal">
          {error ||
            "Your subscription payment could not be processed. No charges were made to your account."}
        </p>

        {/* Subscription Details */}
        {subscriptionData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-600 poppins-normal">Plan:</span>
              <span className="font-semibold poppins-bold">
                {subscriptionData.planType}
              </span>
            </div>
            {subscriptionData.amount > 0 && (
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="text-gray-600 poppins-normal">Amount:</span>
                <span className="font-semibold poppins-bold">
                  {formatCurrency(subscriptionData.amount)}
                </span>
              </div>
            )}
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-600 poppins-normal">
                Subscription ID:
              </span>
              <span className="font-semibold poppins-bold text-xs">
                {subscriptionData.subscriptionID}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 poppins-normal">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {subscriptionData.status}
              </span>
            </div>
          </div>
        )}

        {/* Common Issues Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2 poppins-bold text-sm">
            Common Issues:
          </h3>
          <ul className="space-y-1 text-xs text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Insufficient balance in your payment account</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Payment method verification required</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Network connection interrupted</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Payment timeout or session expired</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetrySubscription}
            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
            style={{ backgroundColor: "#2c8068" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#256b56")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2c8068")
            }
          >
            Try Again with Different Payment
          </button>

          <Link
            href="/dashboard"
            className="inline-block w-full text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200 poppins-bold hover:bg-gray-50"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 poppins-normal">
            Need help? Contact our support team
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <a
              href="mailto:support@kuwago.com"
              className="text-[#2c8068] hover:underline poppins-normal"
            >
              support@kuwago.com
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="tel:+639123456789"
              className="text-[#2c8068] hover:underline poppins-normal"
            >
              +63 912 345 6789
            </a>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4 poppins-normal italic">
          You can try subscribing again anytime. No charges were processed.
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionFailed() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <SubscriptionFailedContent />
    </Suspense>
  );
}
