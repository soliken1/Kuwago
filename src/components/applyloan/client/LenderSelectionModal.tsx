"use client";
import React, { useState } from "react";
import { useChooseLender } from "@/hooks/lend/useChooseLender";
import toast from "react-hot-toast";

interface RecommendedLender {
  lenderUID: string;
  compatibilityScore: number;
  lenderTIN: string;
  lenderFullName: string;
  lenderProfilePicture: string;
  principalAmount: number;
  termsOfPayment: number[];
  interestRates: number[];
  subscriptionType: number;
  gracePeriod: number;
  reasoning: string;
}

interface LenderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanRequestId: string;
  recommendedLenders: RecommendedLender[];
  onSuccess?: () => void;
}

export default function LenderSelectionModal({
  isOpen,
  onClose,
  loanRequestId,
  recommendedLenders,
  onSuccess,
}: LenderSelectionModalProps) {
  const [selectedLender, setSelectedLender] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { chooseLender, loading } = useChooseLender();

  if (!isOpen) return null;

  const handleSelectLender = (lenderUID: string) => {
    setSelectedLender(lenderUID);
  };

  const handleConfirm = async () => {
    if (!selectedLender) {
      toast.error("Please select a lender");
      return;
    }

    try {
      await chooseLender({
        lenderUid: selectedLender,
        loanRequestId: loanRequestId,
      });
      toast.success("Lender selected successfully!");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Failed to choose lender:", err);
      toast.error("Failed to select lender. Please try again.");
    }
  };

  const calculateAverageInterestRate = (rates: number[]) => {
    if (rates.length === 0) return 0;
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  };

  const calculateAverageTerm = (terms: number[]) => {
    if (terms.length === 0) return 0;
    return Math.round(terms.reduce((sum, term) => sum + term, 0) / terms.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center px-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl p-8 relative animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(44, 128, 104, 0.1)' }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#2c8068' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 poppins-bold">
              Choose a Lender
            </h2>
          </div>

          <p className="text-gray-600 mb-6 poppins-normal">
            Select a lender from the recommended options below. Each lender has been matched based on your loan requirements.
          </p>

          {/* Lender Cards */}
          <div className="space-y-4 mb-6">
            {recommendedLenders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recommended lenders available at this time.
              </div>
            ) : (
              recommendedLenders.map((lender, index) => {
                const isSelected = selectedLender === lender.lenderUID;
                const avgInterestRate = calculateAverageInterestRate(lender.interestRates);
                const avgTerm = calculateAverageTerm(lender.termsOfPayment);

                return (
                  <div
                    key={lender.lenderUID}
                    onClick={() => handleSelectLender(lender.lenderUID)}
                    className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-200 ${
                      isSelected
                        ? "shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: "#2c8068",
                            backgroundColor: "rgba(44, 128, 104, 0.05)",
                          }
                        : {}
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                              !lender.lenderProfilePicture ? "bg-gray-200" : ""
                            }`}
                            style={
                              isSelected && lender.lenderProfilePicture
                                ? { border: "2px solid #2c8068" }
                                : isSelected
                                ? { backgroundColor: "#2c8068" }
                                : {}
                            }
                          >
                            {lender.lenderProfilePicture && !failedImages.has(lender.lenderUID) ? (
                              <img
                                src={lender.lenderProfilePicture}
                                alt={lender.lenderFullName}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setFailedImages((prev) => new Set(prev).add(lender.lenderUID));
                                }}
                              />
                            ) : (
                              <span className="text-gray-600 font-bold text-sm">
                                {lender.lenderFullName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "#2c8068" }}
                            >
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 poppins-semibold">
                            {lender.lenderFullName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            TIN: {lender.lenderTIN}
                          </p>
                        </div>
                      </div>
                      
                      {/* Compatibility Score Badge */}
                      <div 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl"
                        style={{ backgroundColor: 'rgba(44, 128, 104, 0.1)' }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: '#2c8068' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span 
                          className="font-bold poppins-bold"
                          style={{ color: '#2c8068' }}
                        >
                          {lender.compatibilityScore.toFixed(1)}%
                        </span>
                        <span 
                          className="text-sm poppins-medium"
                          style={{ color: '#2c8068' }}
                        >
                          Match
                        </span>
                      </div>
                    </div>

                    {/* Lender Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1 poppins-medium">
                          Principal Amount
                        </p>
                        <p className="text-lg font-bold text-gray-900 poppins-bold">
                          ₱{lender.principalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1 poppins-medium">
                          Avg Interest Rate
                        </p>
                        <p className="text-lg font-bold text-gray-900 poppins-bold">
                          {avgInterestRate.toFixed(2)}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1 poppins-medium">
                          Avg Payment Term
                        </p>
                        <p className="text-lg font-bold text-gray-900 poppins-bold">
                          {avgTerm} months
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1 poppins-medium">
                          Grace Period
                        </p>
                        <p className="text-lg font-bold text-gray-900 poppins-bold">
                          {lender.gracePeriod} days
                        </p>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div 
                      className="rounded-xl p-4 border-l-4"
                      style={{ 
                        backgroundColor: 'rgba(44, 128, 104, 0.05)',
                        borderLeftColor: '#2c8068'
                      }}
                    >
                      <p className="text-sm text-gray-700 poppins-normal">
                        <span 
                          className="font-semibold poppins-semibold"
                          style={{ color: '#2c8068' }}
                        >
                          Why this lender?
                        </span>
                        <br />
                        {lender.reasoning}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-colors poppins-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLender || loading}
              className={`flex-1 py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold text-white font-semibold ${
                selectedLender && !loading
                  ? ""
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              style={
                selectedLender && !loading
                  ? { backgroundColor: "#2c8068" }
                  : {}
              }
              onMouseEnter={
                selectedLender && !loading
                  ? (e) =>
                      ((e.target as HTMLButtonElement).style.backgroundColor =
                        "#236653")
                  : undefined
              }
              onMouseLeave={
                selectedLender && !loading
                  ? (e) =>
                      ((e.target as HTMLButtonElement).style.backgroundColor =
                        "#2c8068")
                  : undefined
              }
            >
              {loading ? "Processing..." : "Confirm Selection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

