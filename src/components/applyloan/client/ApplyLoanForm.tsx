"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitLoanRequest } from "@/hooks/lend/requestLoan";
import toast from "react-hot-toast";

const maritalOptions = [
  { label: "Single", value: 1 },
  { label: "Married", value: 2 },
  { label: "Divorced", value: 3 },
  { label: "Widowed", value: 4 },
];

const educationOptions = [
  { label: "None", value: 0 },
  { label: "High School", value: 1 },
  { label: "College", value: 2 },
  { label: "Vocational", value: 3 },
  { label: "Masters", value: 4 },
  { label: "Doctorate", value: 5 },
];

const residentOptions = [
  { label: "Owned", value: 1 },
  { label: "Rented", value: 2 },
  { label: "Living With Relatives", value: 3 },
  { label: "Government Provided", value: 4 },
];

const loanTypeOptions = [
  { label: "Personal", value: 1 },
  { label: "Micro Business", value: 2 },
  { label: "Emergency", value: 3 },
  { label: "Education", value: 4 },
  { label: "Medical", value: 5 },
  { label: "Home Improvement", value: 6 },
];

const loanAmountOptions = [
  { label: "₱1,000", value: 1000 },
  { label: "₱2,000", value: 2000 },
  { label: "₱5,000", value: 5000 },
  { label: "₱10,000", value: 10000 },
  { label: "₱20,000", value: 20000 },
];

export default function ApplyLoanForm() {
  const router = useRouter();
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

  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const isValid =
    formData.employmentInformation &&
    formData.detailedAddress &&
    formData.loanPurpose;

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const res = await submitLoanRequest(formData);
      toast.success("Loan request submitted successfully!");
      router.push("/dashboard");
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
          {/* Personal Details Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block w-2 h-5 rounded bg-blue-400" />
              <h2 className="poppins-semibold text-lg text-gray-700">
                Personal Details
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marital Status */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Marital Status
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.maritalStatus}
                  onChange={(e) =>
                    handleChange("maritalStatus", parseInt(e.target.value))
                  }
                >
                  {maritalOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Highest Education */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Highest Education
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.highestEducation}
                  onChange={(e) =>
                    handleChange("highestEducation", parseInt(e.target.value))
                  }
                >
                  {educationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Employment & Address Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block w-2 h-5 rounded" style={{ backgroundColor: '#85d4a4' }} />
              <h2 className="poppins-semibold text-lg text-gray-700">
                Employment & Address
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Employment Info */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Employment Information *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  placeholder="e.g., Job title, Company"
                  value={formData.employmentInformation}
                  onChange={(e) =>
                    handleChange("employmentInformation", e.target.value)
                  }
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Detailed Address *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  placeholder="Street, Barangay, City"
                  value={formData.detailedAddress}
                  onChange={(e) => handleChange("detailedAddress", e.target.value)}
                  required
                />
              </div>

              {/* Resident Type */}
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Resident Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.residentType}
                  onChange={(e) =>
                    handleChange("residentType", parseInt(e.target.value))
                  }
                >
                  {residentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
              disabled={!isValid}
              className={`px-6 py-3 rounded-2xl text-white font-bold transition ${
                isValid ? "" : "bg-gray-300 cursor-not-allowed"
              }`}
              style={isValid ? { backgroundColor: '#85d4a4' } : {}}
              onMouseEnter={isValid ? (e) => (e.target as HTMLButtonElement).style.backgroundColor = '#236653' : undefined}
              onMouseLeave={isValid ? (e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068' : undefined}
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
