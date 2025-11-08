"use client";
import React, { useState } from "react";
import {
  CreditScoreData,
  CreditScoreCategoryData,
  AIAssessmentData,
} from "@/hooks/users/useCreditScore";
import X from "../../../../assets/actions/X";

interface NewCreditScoreProps {
  creditScoreData?: CreditScoreData | null;
  creditScoreCategory?: CreditScoreCategoryData | null;
  aiAssessment?: AIAssessmentData | null;
  loading?: boolean;
}

export default function NewCreditScore({
  creditScoreData,
  creditScoreCategory,
  aiAssessment,
  loading = false,
}: NewCreditScoreProps) {
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  // Use fetched score or default
  const score = creditScoreData?.score || "N/A";

  // Use category directly from API
  const status = creditScoreCategory?.category || "N/A";

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleImproveScore = () => {
    if (aiAssessment) {
      setShowAIModal(true);
    }
  };

  const formatAISuggestion = (suggestion: string) => {
    return suggestion
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
  };

  // NEW: Handle array of suggestions
  const renderAISuggestions = () => {
    if (!aiAssessment?.aiSuggestion) return null;

    // Check if it's an array
    if (Array.isArray(aiAssessment.aiSuggestion)) {
      return (
        <div className="space-y-4">
          {aiAssessment.aiSuggestion.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-white rounded-lg p-4 border border-purple-200"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <div
                className="flex-1 text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatAISuggestion(suggestion),
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    // Fallback for single string (legacy support)
    return (
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: `<p>${formatAISuggestion(aiAssessment.aiSuggestion)}</p>`,
        }}
      />
    );
  };

  return (
    <>
      <div className="bg-[#2c8068] rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Text Content */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-white text-4xl font-bold mb-2">
                Credit Score
              </h2>
              <p className="text-white/90 text-lg">
                Your current credit standing
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="px-6 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Details
              </button>
              <button
                onClick={handleImproveScore}
                disabled={!aiAssessment || loading}
                className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Improve Score
              </button>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-white text-5xl font-bold">
                {loading ? "..." : score}
              </span>
            </div>
            <div className="px-6 py-2 bg-white/20 rounded-full">
              <span className="text-white font-medium text-lg">
                {loading ? "..." : status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Score Details Modal */}
      {showModal && creditScoreData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Credit Score Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Credit Score Overview */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-2 h-5 rounded bg-[#2c8068]" />
                  <span className="font-semibold text-sm text-gray-700">
                    Credit Score Overview
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Current Score</span>
                    <span className="mt-1 text-gray-800 font-medium text-3xl">
                      {creditScoreData.score}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Rating</span>
                    <span
                      className={`mt-1 inline-block w-fit px-4 py-2 text-lg rounded-full font-medium ${
                        status === "Excellent"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : status === "Very Good"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : status === "Good"
                          ? "bg-cyan-100 text-cyan-700 border border-cyan-300"
                          : status === "Fair"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                          : "bg-red-100 text-red-700 border border-red-300"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {formatDate(creditScoreData.lastUpdated)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan History */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-2 h-5 rounded bg-blue-400" />
                  <span className="font-semibold text-sm text-gray-700">
                    Loan History
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total Loans</span>
                      <span className="mt-1 text-gray-800 font-medium text-2xl">
                        {creditScoreData.totalLoans}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col bg-green-50 rounded-lg p-4 border border-green-200">
                      <span className="text-sm text-green-600 font-medium">
                        Successful Repayments
                      </span>
                      <span className="mt-2 text-green-700 font-bold text-2xl">
                        {creditScoreData.successfulRepayments}
                      </span>
                      <span className="text-xs text-green-600 mt-1">
                        {creditScoreData.totalLoans > 0
                          ? `${(
                              (creditScoreData.successfulRepayments /
                                creditScoreData.totalLoans) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}{" "}
                        of total
                      </span>
                    </div>
                    <div className="flex flex-col bg-red-50 rounded-lg p-4 border border-red-200">
                      <span className="text-sm text-red-600 font-medium">
                        Missed Repayments
                      </span>
                      <span className="mt-2 text-red-700 font-bold text-2xl">
                        {creditScoreData.missedRepayments}
                      </span>
                      <span className="text-xs text-red-600 mt-1">
                        {creditScoreData.totalLoans > 0
                          ? `${(
                              (creditScoreData.missedRepayments /
                                creditScoreData.totalLoans) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}{" "}
                        of total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assessment Modal */}
      {showAIModal && aiAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* AI Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </span>
                AI Credit Score Improvement Suggestions
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>

            {/* AI Modal Content */}
            <div className="p-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></span>
                  <span className="font-semibold text-lg text-gray-800">
                    Personalized AI Analysis
                  </span>
                </div>
                {renderAISuggestions()}
              </div>
            </div>

            {/* AI Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
