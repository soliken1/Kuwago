"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccess() {
  const router = useRouter();

  // Mock data - in a real app, this would come from props or state
  const paymentData = {
    amount: "₱15,000.00",
    paymentDate: "December 15, 2024",
    dueDate: "December 20, 2024",
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      {/* Success Icon */}
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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

      {/* Success Message */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2 poppins-bold">
        Payment Successful
      </h1>


      {/* Thank You Message */}
      <p className="text-gray-600 mb-8 poppins-normal">
        Thank you for your payment. Your loan will be processed shortly.
      </p>

      {/* Action Button */}
      <Link
        href="/approvedloans"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
      >
        Go to Approved Loans
      </Link>
    </div>
  );
}