"use client";
import { Application } from "@/types/lendings";
import React, { useState } from "react";
import { BiBell } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

interface NewHeaderProps {
  title?: string;
  subtitle?: string;
  userLoans?: Application | Application[] | null; // ✅ include null
}

export default function NewHeader({
  title = "Dashboard",
  subtitle = "Welcome to your loan management dashboard",
  userLoans,
}: NewHeaderProps) {
  const [showNotif, setShowNotif] = useState(false);

  // Normalize to array
  const loansArray = Array.isArray(userLoans)
    ? userLoans
    : userLoans
    ? [userLoans]
    : [];

  // Check for active loan
  const activeLoan = loansArray.find(
    (loan) => loan.loanStatus === "InProgress" || loan.loanStatus === "Approved"
  );

  const hasActiveLoan = Boolean(activeLoan);

  const getNotifMessage = () => {
    if (!activeLoan) return "";
    if (activeLoan.loanStatus === "InProgress")
      return "Your loan application is in progress.";
    if (activeLoan.loanStatus === "Approved")
      return "Your loan has been approved!";
    return "";
  };

  return (
    <div className="bg-white px-8 py-6 flex justify-between items-center relative">
      {/* Left side text */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{title}</h1>
        <p className="text-gray-600 text-lg">{subtitle}</p>
      </div>

      {/* Right side notification bell */}
      <div className="relative flex items-center justify-center">
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative focus:outline-none"
        >
          <BiBell className="text-2xl text-gray-700 cursor-pointer hover:text-gray-900 transition" />
          {hasActiveLoan && (
            <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Tooltip Notification Dropdown */}
        <AnimatePresence>
          {showNotif && hasActiveLoan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-10 w-64 bg-white shadow-lg rounded-lg border border-gray-200 p-4 z-50"
            >
              <p className="text-gray-800 text-sm">{getNotifMessage()}</p>
            </motion.div>
          )}
          {showNotif && !hasActiveLoan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-10 w-64 bg-white shadow-lg rounded-lg border border-gray-200 p-4 z-50"
            >
              <p className="text-gray-600 text-sm">
                No active loans at the moment.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
