"use client";
import React from "react";

interface LoanApplicationModalProps {
  selectedLender: { username: string } | null;
  onBack: () => void;
  onSubmit: (formData: any) => void;
  formData: any;
  setFormData: any;
}

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

export default function LoanApplicationModal({
  onBack,
  onSubmit,
  formData,
  setFormData,
}: LoanApplicationModalProps) {
  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const isValid =
    formData.employmentInformation &&
    formData.detailedAddress &&
    formData.loanPurpose;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto py-6">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-2xl font-semibold sticky top-0 bg-white z-10 py-4 border-b border-gray-100 px-6">
          Apply for a Loan
        </h2>

        {/* Marital Status */}
        <div className="px-6">
          <label className="block font-medium mb-1">Marital Status</label>
          <select
            className="w-full border rounded px-3 py-2"
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
        <div className="px-6">
          <label className="block font-medium mb-1">Highest Education</label>
          <select
            className="w-full border rounded px-3 py-2"
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

        {/* Employment Info */}
        <div className="px-6">
          <label className="block font-medium mb-1">
            Employment Information
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Job title, Company"
            value={formData.employmentInformation}
            onChange={(e) =>
              handleChange("employmentInformation", e.target.value)
            }
          />
        </div>

        {/* Address */}
        <div className="px-6">
          <label className="block font-medium mb-1">Detailed Address</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Street, Barangay, City"
            value={formData.detailedAddress}
            onChange={(e) => handleChange("detailedAddress", e.target.value)}
          />
        </div>

        {/* Resident Type */}
        <div className="px-6">
          <label className="block font-medium mb-1">Resident Type</label>
          <select
            className="w-full border rounded px-3 py-2"
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

        {/* Loan Type */}
        <div className="px-6">
          <label className="block font-medium mb-1">Loan Type</label>
          <select
            className="w-full border rounded px-3 py-2"
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
        <div className="px-6">
          <label className="block font-medium mb-1">Loan Amount</label>
          <select
            className="w-full border rounded px-3 py-2"
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

        {/* Loan Purpose */}
        <div className="px-6">
          <label className="block font-medium mb-1">Loan Purpose</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Explain how you will use this loan..."
            value={formData.loanPurpose}
            onChange={(e) => handleChange("loanPurpose", e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 sticky bottom-0 bg-white pb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Go Back
          </button>
          <button
            onClick={() => onSubmit(formData)}
            disabled={!isValid}
            className={`px-4 py-2 rounded text-white ${
              isValid ? "bg-green-500 hover:bg-green-600" : "bg-gray-300"
            }`}
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
