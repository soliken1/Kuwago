"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePaymentFailed } from "@/hooks/payment/usePaymentFailed";

export default function PaymentFailed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  
  const { paymentData, loading, error } = usePaymentFailed(paymentId);

  // Show loading state during SSR or when no paymentId
  if (!paymentId) {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      {/* Failed Icon */}
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
        Payment Failed
      </h1>

      {/* Payment Details */}
      {loading ? (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-red-600 poppins-normal">{error}</p>
        </div>
      ) : paymentData ? (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 poppins-normal">Amount:</span>
              <span className="text-lg font-semibold text-gray-900 poppins-bold">
                {formatCurrency(paymentData.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 poppins-normal">Attempted Date:</span>
              <span className="text-gray-900 poppins-normal">
                {formatDate(paymentData.paymentDate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 poppins-normal">Due Date:</span>
              <span className="text-gray-900 poppins-normal">
                {formatDate(paymentData.dueDate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 poppins-normal">Status:</span>
              <span className="text-red-600 poppins-normal">
                {paymentData.status || "Failed"}
              </span>
            </div>
            {paymentData.failureReason && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 poppins-normal">Reason:</span>
                <span className="text-red-600 poppins-normal text-sm">
                  {paymentData.failureReason}
                </span>
              </div>
            )}
            {paymentData.errorMessage && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 poppins-normal">Error:</span>
                <span className="text-red-600 poppins-normal text-sm">
                  {paymentData.errorMessage}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Error Message */}
      <p className="text-gray-600 mb-8 poppins-normal">
        Your payment could not be processed. Please try again or contact support if the issue persists.
      </p>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => router.back()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
        >
          Try Again
        </button>
        <Link
          href="/approvedloans"
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold inline-block"
        >
          Go to Approved Loans
        </Link>
      </div>
    </div>
  );
}