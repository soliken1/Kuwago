"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitLoanRequest } from "@/hooks/lend/requestLoan";
import { BUSINESS_TYPE_LABELS, LOAN_TYPE_LABELS, LOAN_AMOUNT_VALUES, getLoanAmountLabel } from "@/types/loanTypes";
import toast from "react-hot-toast";
import LenderSelectionModal from "./LenderSelectionModal";

const businessTypeOptions = Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => ({
  label,
  value: parseInt(value),
}));

const loanTypeOptions = Object.entries(LOAN_TYPE_LABELS).map(([value, label]) => ({
  label,
  value: parseInt(value),
}));

const loanAmountOptions = Object.entries(LOAN_AMOUNT_VALUES).map(([value]) => ({
  label: getLoanAmountLabel(parseInt(value)),
  value: parseInt(value),
}));

export default function ApplyLoanForm() {
  const router = useRouter();
  const { submitLoanRequest, loading } = useSubmitLoanRequest();

  const [formData, setFormData] = useState({
    businessType: 1,
    businessTIN: "",
    loanType: 1,
    loanAmount: 1000,
    loanPurpose: "",
  });

  const [showLenderModal, setShowLenderModal] = useState(false);
  const [loanRequestId, setLoanRequestId] = useState<string>("");
  const [recommendedLenders, setRecommendedLenders] = useState<any[]>([]);

  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const isValid =
    formData.businessTIN.trim() !== "" &&
    formData.loanPurpose.trim() !== "";

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) {
      return; // Prevent duplicate submissions
    }
    
    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await submitLoanRequest(formData);
      toast.success("Loan request submitted successfully!");
      
      // Check if there are recommended lenders
      if (response?.data?.recommendedLenders && response.data.recommendedLenders.length > 0) {
        setLoanRequestId(response.data.loanInfo.loanRequestID);
        setRecommendedLenders(response.data.recommendedLenders);
        setShowLenderModal(true);
      } else {
        // No lenders recommended, navigate to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Loan request failed:", err);
      toast.error("Failed to submit loan request. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="overflow-hidden">
        <form onSubmit={handleLoanSubmit} className="p-8 space-y-4">
          {/* Business Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block w-2 h-5 rounded bg-blue-400" />
              <h2 className="poppins-semibold text-lg text-gray-700">
                Business Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Type */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Business Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.businessType}
                  onChange={(e) =>
                    handleChange("businessType", parseInt(e.target.value))
                  }
                >
                  {businessTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business TIN */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Business TIN *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  placeholder="Enter your business TIN"
                  value={formData.businessTIN}
                  onChange={(e) => handleChange("businessTIN", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Loan Details Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block w-2 h-5 rounded bg-purple-400" />
              <h2 className="poppins-semibold text-lg text-gray-700">
                Loan Details
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loan Type */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Loan Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.loanType}
                  onChange={(e) => handleChange("loanType", parseInt(e.target.value))}
                >
                  {loanTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Loan Amount
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.loanAmount}
                  onChange={(e) =>
                    handleChange("loanAmount", parseInt(e.target.value))
                  }
                >
                  {loanAmountOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loan Purpose */}
            <div className="mt-4">
              <label className="block font-medium mb-2 text-gray-700">
                Loan Purpose *
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                rows={4}
                placeholder="Explain how you will use this loan..."
                value={formData.loanPurpose}
                onChange={(e) => handleChange("loanPurpose", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            
            <button
              type="submit"
              disabled={!isValid || loading}
              className={`px-6 py-3 rounded-2xl text-white font-bold transition ${
                isValid && !loading ? "" : "bg-gray-300 cursor-not-allowed"
              }`}
              style={isValid && !loading ? { backgroundColor: '#2c8068' } : {}}
              onMouseEnter={isValid && !loading ? (e) => (e.target as HTMLButtonElement).style.backgroundColor = '#236653' : undefined}
              onMouseLeave={isValid && !loading ? (e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068' : undefined}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>

      {/* Lender Selection Modal */}
      <LenderSelectionModal
        isOpen={showLenderModal}
        onClose={() => {
          setShowLenderModal(false);
          router.push("/dashboard");
        }}
        loanRequestId={loanRequestId}
        recommendedLenders={recommendedLenders}
        onSuccess={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
