"use client";
import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePaymentDetails } from "@/hooks/payment/usePaymentDetails";
import successfulPayment from "@/utils/successfulPayment";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const { paymentData, loading, error } = usePaymentDetails(paymentId);

  useEffect(() => {
    if (paymentData && paymentData.status === "Completed") {
      successfulPayment(
        "kennethrex456@gmail.com",
        "Admin",
        window.location.href,
        "Payment Successful"
      );
    }
  }, [paymentData]);

  // Format currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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

  if (error || !paymentId) {
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
            {error || "Payment ID not found"}
          </p>
          <Link
            href="/approvedloans"
            className="inline-block w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
            style={{ backgroundColor: "#2c8068" }}
          >
            Go to Approved Loans
          </Link>
        </div>
      </div>
    );
  }

  if (paymentData?.status === "Completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
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
            Payment Successful
          </h1>
          <p className="text-gray-600 mb-6 poppins-normal">
            Thank you for your payment. Your transaction has been processed
            successfully.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600 poppins-normal">Amount Paid:</span>
              <span className="font-semibold poppins-bold">
                {formatCurrency(paymentData.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600 poppins-normal">
                Payment Date:
              </span>
              <span className="font-semibold poppins-bold">
                {formatDate(paymentData.paymentDate)}
              </span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600 poppins-normal">Due Date:</span>
              <span className="font-semibold poppins-bold">
                {formatDate(paymentData.dueDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 poppins-normal">Status:</span>
              <span
                className={`font-semibold poppins-bold ${
                  paymentData.isOnTime ? "text-green-600" : "text-orange-600"
                }`}
              >
                {paymentData.isOnTime ? "On Time" : "Late"}
              </span>
            </div>
          </div>

          <Link
            href="/approvedloans"
            className="inline-block w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
            style={{ backgroundColor: "#2c8068" }}
          >
            Go to Approved Loans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 poppins-normal">
          Payment status: {paymentData?.status || "Unknown"}
        </p>
        <Link
          href="/approvedloans"
          className="inline-block mt-4 w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
          style={{ backgroundColor: "#2c8068" }}
        >
          Go to Approved Loans
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
