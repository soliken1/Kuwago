"use client";
import React, { useState } from "react";
import StepLoanAmount from "./StepBorrowerDetails";
import { useSubmitLoanRequest } from "@/hooks/lend/requestLoan";
import toast from "react-hot-toast";

interface LendModalProps {
  onClose: () => void;
  currentUser: { id: string; name: string; email: string };
  lendersData: any;
  loading: boolean;
}

export default function LendModal({ onClose }: LendModalProps) {
  const { submitLoanRequest } = useSubmitLoanRequest();

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

  const handleLoanSubmit = async (formData: any) => {
    try {
      const res = await submitLoanRequest(formData);

      toast.success("Loan request submitted successfully!");
      onClose(); // Optional: close modal on success
    } catch (err) {
      console.error("Loan request failed:", err);
      toast.error("Failed to submit loan request. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg relative">
        <StepLoanAmount
          onClose={onClose}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleLoanSubmit}
        />
      </div>
    </div>
  );
}
