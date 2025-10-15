"use client";
import React from "react";

interface LoanApplicationModalProps {
  onSubmit: (formData: any) => void;
  formData: any;
  setFormData: any;
  onClose: () => void;
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
  onSubmit,
  formData,
  setFormData,
  onClose,
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
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 poppins-normal custom-scrollbar relative px-2">
        {/* Fixed Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-600 hover:text-gray-800 text-xl bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow-md border border-gray-200 transition"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="px-6 pt-4 pb-2 border-b border-gray-100">
          <h2 className="poppins-bold text-xl text-gray-700 tracking-tight">
            Apply for a Loan
          </h2>
        </div>

        {/* Marital Status */}
        <div className="flex items-center gap-2 mt-3 mb-1 px-6">
          <span className="inline-block w-2 h-5 rounded bg-blue-400" />
          <span className="poppins-semibold text-sm text-gray-700">
            Personal Details
          </span>
        </div>
        <div className="px-6">
          <label className="block font-medium mb-1">Marital Status</label>
          <select
            className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition"
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
            className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition"
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

        {/* Divider */}
        <div className="border-t border-gray-200 mx-6 my-2" />

        <div className="flex items-center gap-2 mt-2 mb-1 px-6">
          <span className="inline-block w-2 h-5 rounded" style={{ backgroundColor: '#85d4a4' }} />
          <span className="poppins-semibold text-sm text-gray-700">
            Employment & Address
          </span>
        </div>
        {/* Employment Info */}
        <div className="px-6">
          <label className="block font-medium mb-1">
            Employment Information
          </label>
          <input
            type="text"
            className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition"
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
            className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition"
            placeholder="Street, Barangay, City"
            value={formData.detailedAddress}
            onChange={(e) => handleChange("detailedAddress", e.target.value)}
          />
        </div>

        {/* Resident Type */}
        <div className="px-6">
          <label className="block font-medium mb-1">Resident Type</label>
          <select
            className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition"
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

        {/* Divider */}
        <div className="border-t border-gray-200 mx-6 my-2" />

        <div className="flex items-center gap-2 mt-2 mb-1 px-6">
          <span className="inline-block w-2 h-5 rounded bg-purple-400" />
          <span className="poppins-semibold text-sm text-gray-700">
            Loan Details
          </span>
        </div>
        {/* Loan Type */}
        <div className="px-6">
          <label className="block font-medium mb-1">Loan Type</label>
          <select
            className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition"
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
            className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition"
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
            className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition"
            rows={3}
            placeholder="Explain how you will use this loan..."
            value={formData.loanPurpose}
            onChange={(e) => handleChange("loanPurpose", e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 sticky bottom-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 pb-4 px-6">
          <button
            onClick={() => onSubmit(formData)}
            disabled={!isValid}
            className={`px-4 py-2 rounded text-white poppins-semibold text-sm ${
              isValid ? "" : "bg-gray-300"
            }`}
            style={isValid ? { backgroundColor: '#85d4a4' } : {}}
            onMouseEnter={isValid ? (e) => e.target.style.backgroundColor = '#6bc48a' : undefined}
            onMouseLeave={isValid ? (e) => e.target.style.backgroundColor = '#85d4a4' : undefined}
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
