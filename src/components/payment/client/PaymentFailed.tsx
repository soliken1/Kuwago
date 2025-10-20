"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentFailed() {
  const router = useRouter();

  // Mock data - in a real app, this would come from props or state
  const paymentData = {
    amount: "₱15,000.00",
    paymentDate: "December 15, 2024",
    dueDate: "December 20, 2024",
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

      {/* Error Message */}
      <p className="text-gray-600 mb-8 poppins-normal">
        Your payment could not be processed. Please try again or contact support if the issue persists.
      </p>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/approvedloans"
          className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold inline-block"
          style={{ backgroundColor: '#2c8068' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#256b56'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2c8068'}
        >
          Go to Approved Loans
        </Link>
      </div>
    </div>
  );
}
