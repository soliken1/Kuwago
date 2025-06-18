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

export default function LendModal({ onClose, currentUser }: LendModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [loanAmount, setLoanAmount] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [docuSignUrl, setDocuSignUrl] = useState("");

  const lenders: Lender[] = [
    { id: "lender1", name: "Lender One", email: "lender1@example.com" },
    { id: "lender2", name: "Lender Two", email: "lender2@example.com" },
    { id: "lender3", name: "Lender Three", email: "lender3@example.com" },
  ];

  const handleLoanSubmit = () => {
    setStep(3);
    initiateCreateDoc();
  };

  const initiateCreateDoc = async () => {
    setIsSigning(true);
    try {
      const response = await fetch("/api/createDoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowerEmail: currentUser.email,
          lenderEmail: selectedLender?.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate signing");
      }

      const { url } = await response.json();
      setDocuSignUrl(url); // You can iframe this if needed
    } catch (error) {
      console.error("PandaDoc Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to initiate signing process"
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

      {isSigning ? (
        <div className="text-center py-8">
          <p>Preparing document for signing...</p>
        </div>
      ) : docuSignUrl ? (
        <div className="h-96">
          <iframe
            src={docuSignUrl}
            className="w-full h-full border"
            title="DocuSign Document"
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
