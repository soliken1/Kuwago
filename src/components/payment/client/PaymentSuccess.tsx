"use client";
import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import failedPayment from "@/utils/FailedPayment";
import successfulPayment from "@/utils/successfulPayment";

export default function PaymentSuccess() {
  const router = useRouter();

  // Mock data - in a real app, this would come from props or state
  const paymentData = {
    amount: "₱4,000.00",
    paymentDate: "October 15, 2024",
    dueDate: "December 20, 2024",
  };

  //On this part, maybe backend will have a fetch request of the payment details and status based on an Id
  //to check if its completed, failed or successful. based on maybe params being passed from the backend from paymongo
  //e.g paymongo redirect => backend sends => success||failed?payableId=12345 => frontend requests payableId=12345 =>
  //backend receives the request and return status, details => frontend checks if payment is successful or failed plus details

  // Proposed solution (if applicable)
  // useEffect(() => {
  //   const { payableId } = useParams();

  //   const loadPayable = async () => {
  //     const response = await fetchPayableData(payableId)

  //     //maybe:
  //     const payableStatus = response.loanStatus === "Completed" ? true : false

  //     setStatus(payableStatus)

  //     //Then component body should be dynamic based on status
  //     {status ? (
  //       <PaymentSuccess/>
  //     ): (
  //       <PaymentFailed/>
  //     )}
  //   }
  // }, []);

  //This part should also send a notification to BOTH admin and lenders via email use: (if applicable)
  // successfulPayment(admin_email(s), admin_names(s), redirectUrl, "subject") || failedPayment(lender_email, lender_name, redirectUrl, "subject")

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
        className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold"
        style={{ backgroundColor: "#2c8068" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#256b56")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#2c8068")
        }
      >
        Go to Approved Loans
      </Link>
    </div>
  );
}
