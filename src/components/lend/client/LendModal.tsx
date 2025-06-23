"use client";
import React, { useState } from "react";
import StepSelectLender from "./StepSelectLender";
import StepLoanAmount from "./StepBorrowerDetails";
import StepSigning from "./StepGenerateDocument";
import { useSubmitLoanRequest } from "@/hooks/lend/requestLoan";
import { useFetchLoanRequest } from "@/hooks/lend/requestCurrentLoan";

interface LendModalProps {
  onClose: () => void;
  currentUser: { id: string; name: string; email: string };
  lendersData: any;
  loading: boolean;
}

interface Lender {
  uid: string;
  username: string;
  email: string;
  profilePicture: string;
  phoneNumber: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function LendModal({
  onClose,
  currentUser,
  lendersData,
  loading,
}: LendModalProps) {
  const { submitLoanRequest, success } = useSubmitLoanRequest();
  const { getLoanRequest } = useFetchLoanRequest();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [currentLoanId, setCurrentLoanId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [docuSignUrl, setDocuSignUrl] = useState("");
  const [error, setError] = useState("");
  const [sendingMethod, setSendingMethod] = useState<
    "email" | "embedded" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [formData, setFormData] = useState({
    maritalStatus: 1,
    highestEducation: 0,
    employmentInformation: "",
    detailedAddress: "",
    residentType: 1,
    loanType: 1,
    loanAmount: 1000,
    loanPurpose: "",
  });
  const itemsPerPage = 3;

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

  const initiateCreateDoc = async (loanId: any) => {
    setIsProcessing(true);
    setError("");
    setDocuSignUrl("");
    setSendingMethod(null);

    try {
      const fetchCurrentLoan = await getLoanRequest(currentUser.id, loanId);
      setLoanAmount(Number(fetchCurrentLoan.loanAmount ?? 0));
      if (!selectedLender) {
        throw new Error("No lender selected");
      }

      const createResponse = await fetch("/api/document/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerEmail: currentUser.email,
          borrowerName: currentUser.name,
          lenderEmail: selectedLender.email,
          lenderName: selectedLender.username,
          loanAmount: fetchCurrentLoan.loanAmount,
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

  const handleLoanSubmit = async (formData: any) => {
    try {
      const loanId = await submitLoanRequest(formData);
      setCurrentLoanId(loanId);
      setStep(3);
      await initiateCreateDoc(loanId);
    } catch (err) {
      console.error("Loan request failed:", err);
    }
  };

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
        {step === 2 && (
          <StepLoanAmount
            formData={formData}
            setFormData={setFormData}
            onBack={() => setStep(1)}
            onSubmit={handleLoanSubmit}
            selectedLender={selectedLender}
          />
        )}

        {step === 3 && (
          <StepSigning
            currentUser={currentUser}
            selectedLender={selectedLender}
            loanAmount={loanAmount}
            docuSignUrl={docuSignUrl}
            error={error}
            isProcessing={isProcessing}
            sendingMethod={sendingMethod}
            onRetry={(loanId) => {
              initiateCreateDoc(loanId);
            }}
            onBack={() => setStep(2)}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
