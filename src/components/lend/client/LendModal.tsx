"use client";
import React, { useState, useEffect } from "react";
import useGetLenderUsers from "@/hooks/users/requestLenderUsers";
import StepSelectLender from "./StepSelectLender";

interface LendModalProps {
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface Lender {
  uid: string;
  username: string;
  email: string;
  profilePicture: string;
  phoneNumber: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function LendModal({ onClose, currentUser }: LendModalProps) {
  const { lenderUsers, lendersData, loading } = useGetLenderUsers();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [loanAmount, setLoanAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [docuSignUrl, setDocuSignUrl] = useState("");
  const [error, setError] = useState("");
  const [sendingMethod, setSendingMethod] = useState<
    "email" | "embedded" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  useEffect(() => {
    lenderUsers();
  }, []);

  const dynamicLenders: Lender[] =
    lendersData?.data && Array.isArray(lendersData.data)
      ? lendersData.data.map((user: any) => ({
          uid: user.uid,
          username: user.username,
          email: user.email || "No email",
          profilePicture: user.profilePicture,
          phoneNumber: user.phoneNumber,
        }))
      : [];

  const filteredLenders = dynamicLenders.filter((lender) =>
    lender.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLenders.length / itemsPerPage);
  const paginatedLenders = filteredLenders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sendDocument = async (documentId: string): Promise<string | null> => {
    try {
      setSendingMethod("email");
      const response = await fetch("/api/document/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          message: "ACTION REQUIRED: Loan Agreement",
          subject: `Loan Agreement - ${loanAmount}`,
          force: true,
        }),
      });
      const result = await response.json();
      console.log("Send response:", result);

      if (!response.ok) {
        // Handle document not ready (409 Conflict)
        if (response.status === 409) {
          await delay(result.nextCheckAfter * 1000 || 5000);
          return sendDocument(documentId); // Retry
        }

        // Handle embedded signing fallback
        if (result.error?.code === 403) {
          setSendingMethod("embedded");
          const embeddedResponse = await fetch("/api/document/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentId,
              useEmbeddedSigning: true,
            }),
          });

          const embeddedResult = await embeddedResponse.json();
          if (!embeddedResponse.ok) {
            throw new Error(embeddedResult.error || "Embedded signing failed");
          }
          return embeddedResult.signingUrl || null;
        }

        throw new Error(result.error || "Failed to send document");
      }

      // Return signing URL if available
      if (result.signingUrl) {
        return result.signingUrl;
      }

      // Consider it successful if we get here
      return null;
    } catch (error) {
      console.error("Send error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to send document"
      );
    }
  };

  const initiateCreateDoc = async () => {
    setIsProcessing(true);
    setError("");
    setDocuSignUrl("");
    setSendingMethod(null);

    try {
      if (!selectedLender) {
        throw new Error("No lender selected");
      }

      // 1. Create document
      const createResponse = await fetch("/api/document/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerEmail: currentUser.email,
          borrowerName: currentUser.name,
          lenderEmail: selectedLender.email,
          lenderName: selectedLender.username,
          loanAmount: loanAmount,
        }),
      });

      const data = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(data.error || "Failed to create document");
      }

      // 2. Wait for document processing
      await delay(8000);

      // 3. Send with retry logic
      let signingUrl: string | null = null;
      let attempts = 0;

      while (attempts < 3 && !signingUrl) {
        try {
          signingUrl = await sendDocument(data.documentId);
          attempts++;
          if (!signingUrl) break; // Email was sent successfully

          // If we got a URL but want to wait for email
          await delay(3000);
        } catch (err) {
          console.error(`Send attempt ${attempts + 1} failed:`, err);
          await delay(5000);
          attempts++;
        }
      }

      // 4. Handle result
      if (signingUrl) {
        setDocuSignUrl(signingUrl);
      } else {
        setDocuSignUrl("email-sent");
      }
    } catch (err: any) {
      console.error("Document processing error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process document"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoanSubmit = async () => {
    setStep(3);
    await initiateCreateDoc();
  };

  const renderStep2 = () => (
    <>
      <h2 className="text-xl font-semibold mb-4">
        Loan Request from {selectedLender?.username}
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
        {step === 1 && (
          <StepSelectLender
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            paginatedLenders={paginatedLenders}
            selectedLender={selectedLender}
            setSelectedLender={setSelectedLender}
            setStep={setStep}
          />
        )}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
}
