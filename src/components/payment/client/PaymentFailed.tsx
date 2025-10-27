"use client";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePaymentDetails } from "@/hooks/payment/usePaymentDetails";
import failedPayment from "@/utils/FailedPayment";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const { paymentData, loading, error } = usePaymentDetails(paymentId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  useEffect(() => {
    if (paymentData && paymentData.status === "Cancelled") {
      failedPayment(
        "kennethrex456@gmail.com",
        "Admin",
        window.location.href,
        "Payment Failed"
      );
    }
  }, [paymentData]);

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

        {/* Failed Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2 poppins-bold">
          Payment Failed
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-6 poppins-normal">
          {error ||
            "Your payment could not be processed. Please try again or contact support."}
        </p>

        {/* Payment Details */}
        {paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600 poppins-normal">Payment ID:</span>
              <span className="font-semibold poppins-bold text-sm">
                {paymentData.paymentId}
              </span>
            </div>
            {paymentData.amountPaid > 0 && (
              <div className="flex justify-between mb-3">
                <span className="text-gray-600 poppins-normal">Amount:</span>
                <span className="font-semibold poppins-bold">
                  {formatCurrency(paymentData.amountPaid)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 poppins-normal">Status:</span>
              <span className="font-semibold poppins-bold text-red-600">
                {paymentData.status}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
            style={{ backgroundColor: "#2c8068" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#256b56")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2c8068")
            }
          >
            Try Again
          </button>

          <Link
            href="/approvedloans"
            className="inline-block w-full text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200 poppins-bold hover:bg-gray-50"
          >
            Go to Approved Loans
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailed() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
