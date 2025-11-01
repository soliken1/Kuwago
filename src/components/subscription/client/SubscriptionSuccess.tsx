"use client";
import React, { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getCookie } from "cookies-next";
import successfulPayment from "@/utils/successfulPayment";

interface SubscriptionDetails {
  subscriptionID: string;
  lenderUID: string;
  planType: string;
  startDate: string;
  endDate: string;
  status: string;
  isOnTime?: boolean;
}

function SubscriptionSuccessContent() {
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

          // Send success notification email
          const user = localStorage.getItem("user");
          if (user) {
            successfulPayment(
              "kennethrex456@gmail.com",
              "Admin",
              window.location.href,
              "Payment Successful"
            );
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanDuration = (planType: string) => {
    switch (planType) {
      case "Monthly":
        return "1 month";
      case "Quarterly":
        return "3 months";
      case "Yearly":
        return "12 months";
      default:
        return planType;
    }
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

  if (error || !subscriptionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2 poppins-bold">
            Error
          </h1>
          <p className="text-gray-600 mb-8 poppins-normal">
            {error || "Subscription ID not found"}
          </p>
          <Link
            href="/dashboard"
            className="inline-block w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
            style={{ backgroundColor: "#2c8068" }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (subscriptionData?.status === "Active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2 poppins-bold">
            Subscription Activated!
          </h1>
          <p className="text-gray-600 mb-6 poppins-normal">
            Your subscription has been successfully activated. You now have full
            access to all lender features.
          </p>

          {/* Subscription Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-600 poppins-normal">Plan:</span>
              <span className="font-semibold poppins-bold text-[#2c8068]">
                {subscriptionData.planType}
              </span>
            </div>
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-600 poppins-normal">Duration:</span>
              <span className="font-semibold poppins-bold">
                {getPlanDuration(subscriptionData.planType)}
              </span>
            </div>
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-600 poppins-normal">Start Date:</span>
              <span className="font-semibold poppins-bold">
                {formatDate(subscriptionData.startDate)}
              </span>
            </div>
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-600 poppins-normal">Expires On:</span>
              <span className="font-semibold poppins-bold">
                {formatDate(subscriptionData.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 poppins-normal">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-[#e8f5f1] rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 poppins-bold">
              What's Included:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-[#2c8068] mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                View all borrower loan details
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-[#2c8068] mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Unlimited loan applications
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-[#2c8068] mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Priority customer support
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-[#2c8068] mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Advanced analytics & reports
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="inline-block w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
            style={{ backgroundColor: "#2c8068" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#256b56")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2c8068")
            }
          >
            Go to Dashboard
          </Link>

          <p className="text-xs text-gray-500 mt-4 poppins-normal">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 poppins-normal">
          Subscription status: {subscriptionData?.status || "Unknown"}
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
          style={{ backgroundColor: "#2c8068" }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function SubscriptionSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
