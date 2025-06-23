// components/StepSigning.tsx
import React from "react";

interface StepSigningProps {
  currentUser: { name: string };
  selectedLender: { username: string } | null;
  loanAmount: number;
  docuSignUrl: string;
  error: string;
  isProcessing: boolean;
  sendingMethod: "email" | "embedded" | null;
  onRetry: (loanId: any) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function StepSigning({
  currentUser,
  selectedLender,
  loanAmount,
  docuSignUrl,
  error,
  isProcessing,
  sendingMethod,
  onRetry,
  onBack,
  onClose,
}: StepSigningProps) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Sign Loan Agreement</h2>
      <div className="mb-4">
        <p className="font-medium">Loan Details:</p>
        <p>Lender: {selectedLender?.username}</p>
        <p>Borrower: {currentUser.name}</p>
        <p>Amount: ₱{loanAmount}</p>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {isProcessing ? (
        <div className="text-center py-8">
          <p>
            {sendingMethod === "email"
              ? "Sending document via email..."
              : sendingMethod === "embedded"
              ? "Preparing document for signing..."
              : "Processing document..."}
          </p>
          <div className="mt-4 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 animate-pulse"
              style={{ width: "70%" }}
            ></div>
          </div>
        </div>
      ) : docuSignUrl === "email-sent" ? (
        <div className="text-center py-8">
          <div className="text-green-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <p className="mt-2">
              Document sent successfully to recipient's email!
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      ) : docuSignUrl ? (
        <div className="h-96">
          <iframe
            src={docuSignUrl}
            className="w-full h-full border"
            title="PandaDoc Document"
            onLoad={() => console.log("Document loaded")}
          />
          <div className="mt-4 flex justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Finish
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p>Error loading signing document. Please try again.</p>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}
    </>
  );
}
