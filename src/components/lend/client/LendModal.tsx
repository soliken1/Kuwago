"use client";
import React, { useState } from "react";

interface LendModalProps {
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface Lender {
  id: string;
  name: string;
  email: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function LendModal({ onClose, currentUser }: LendModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [loanAmount, setLoanAmount] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [docuSignUrl, setDocuSignUrl] = useState("");
  const [error, setError] = useState("");

  const lenders: Lender[] = [
    { id: "lender1", name: "Lender One", email: "lender1@example.com" },
    { id: "lender2", name: "Lender Two", email: "lender2@example.com" },
    { id: "lender3", name: "Lender Three", email: "lender3@example.com" },
  ];

  const pollDocumentStatus = async (documentId: string): Promise<string> => {
    let attempts = 0;
    const maxAttempts = 30; // Increased attempts (about 5 minutes total with backoff)
    const baseDelay = 2000; // Start with 2 seconds

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await fetch(`/api/document/status?id=${documentId}`);
        const data = await response.json();

        // Successful cases
        if (data.status === "ready" && data.signingUrl) {
          return data.signingUrl;
        }

        // Still processing cases
        if (data.status === "processing") {
          const delayTime =
            data.nextCheckAfter * 1000 || baseDelay * Math.pow(1.5, attempts);
          await delay(delayTime);
          continue;
        }

        // Document ready but needs to be sent
        if (data.status === "ready" && data.state === "draft") {
          // Automatically send the document
          const sendResponse = await fetch("/api/document/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId }),
          });
          const sendData = await sendResponse.json();

          if (sendData.success) {
            await delay(3000); // Wait for document to transition to 'sent'
            continue;
          }
        }

        // Error cases
        if (data.error) {
          throw new Error(data.error.message || "Document processing error");
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (attempts >= maxAttempts) {
          throw new Error(
            `Document processing timed out after ${maxAttempts} attempts`
          );
        }

        // Exponential backoff with jitter
        const delayTime =
          baseDelay * Math.pow(2, attempts) + Math.random() * 1000;
        await delay(Math.min(delayTime, 30000)); // Max 30s delay
      }
    }
    throw new Error("Maximum polling attempts reached");
  };

  const handleLoanSubmit = async () => {
    setStep(3);
    await initiateCreateDoc();
  };

  const initiateCreateDoc = async () => {
    setIsSigning(true);
    setError("");
    try {
      if (!selectedLender) {
        throw new Error("No lender selected");
      }

      const response = await fetch("/api/document/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerEmail: currentUser.email,
          borrowerName: currentUser.name,
          lenderEmail: selectedLender.email,
          lenderName: selectedLender.name,
          loanAmount: loanAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create document");
      }

      const signingUrl = await pollDocumentStatus(data.documentId);
      setDocuSignUrl(signingUrl);
    } catch (err) {
      console.error("Document error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create document"
      );
    } finally {
      setIsSigning(false);
    }
  };

  const renderStep1 = () => (
    <>
      <h2 className="text-xl font-semibold mb-4">Available Lenders</h2>
      <div className="space-y-3">
        {lenders.map((lender) => (
          <button
            key={lender.id}
            onClick={() => {
              setSelectedLender(lender);
              setStep(2);
            }}
            className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            {lender.name}
          </button>
        ))}
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <h2 className="text-xl font-semibold mb-4">
        Loan Request from {selectedLender?.name}
      </h2>
      <input
        type="number"
        placeholder="Enter loan amount (₱)"
        value={loanAmount}
        onChange={(e) => setLoanAmount(e.target.value)}
        className="w-full px-4 py-2 border rounded-md mb-4"
      />
      <button
        onClick={handleLoanSubmit}
        disabled={!loanAmount}
        className={`w-full py-2 rounded-md ${
          !loanAmount
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
      >
        Continue to Signing
      </button>
      <button
        onClick={() => setStep(1)}
        className="mt-3 w-full text-sm text-gray-500 hover:underline"
      >
        ← Back to lenders
      </button>
    </>
  );

  const renderStep3 = () => (
    <>
      <h2 className="text-xl font-semibold mb-4">Sign Loan Agreement</h2>
      <div className="mb-4">
        <p className="font-medium">Loan Details:</p>
        <p>Lender: {selectedLender?.name}</p>
        <p>Borrower: {currentUser.name}</p>
        <p>Amount: ₱{loanAmount}</p>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {isSigning ? (
        <div className="text-center py-8">
          <p>Preparing document for signing...</p>
          <div className="mt-4 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 animate-pulse"
              style={{ width: "70%" }}
            ></div>
          </div>
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
              onClick={() => setStep(2)}
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
            onClick={initiateCreateDoc}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
}
