"use client";
import React, { useEffect, useState } from "react";
import NewSidebar from "@/components/dashboard/client/NewSidebar";
import LoanHeader from "@/components/applyloan/client/LoanHeader";

interface ApplyLoanLayoutProps {
  children: React.ReactNode;
}

export default function ApplyLoanLayout({ children }: ApplyLoanLayoutProps) {
  const [hasActiveLoans, setHasActiveLoans] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("active_loans");
    // Convert string "true"/"false" to boolean
    setHasActiveLoans(stored === "true");
  }, []);

  return (
    <div className="w-full h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <NewSidebar />
      </div>

      {!hasActiveLoans ? (
        // Main Content (when no active loans)
        <div className="flex-1 flex flex-col min-w-0">
          <LoanHeader />
          <div className="flex-1 p-8 overflow-auto">{children}</div>
        </div>
      ) : (
        // Active Loan Notification
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="bg-white shadow-md rounded-2xl p-10 max-w-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              You currently have an active loan
            </h2>
            <p className="text-gray-600 mb-6">
              You can only apply for a new loan once your existing loan is
              completed or closed.
            </p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
