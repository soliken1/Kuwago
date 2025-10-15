"use client";
import React from "react";
import { Application } from "@/types/lendings";
import { IoClose } from "react-icons/io5";

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

const DetailItem = ({
  label,
  value,
  badge = false,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) => {
  const statusColor = {
    Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    InProgress: "bg-blue-100 text-blue-700 border border-blue-300",
    Approved: "bg-green-100 text-green-700 border border-green-300",
    Denied: "bg-red-100 text-red-700 border border-red-300",
    Completed: "bg-gray-100 text-gray-700 border border-gray-300",
  };

  const getDisplayStatus = (status: string) => {
    return status === "InProgress" ? "In Progress" : status;
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      {badge ? (
        <span
          className={`mt-1 inline-block w-fit px-3 py-1 text-sm rounded-full font-medium ${
            statusColor[value as keyof typeof statusColor] || statusColor.Pending
          }`}
        >
          {getDisplayStatus(value)}
        </span>
      ) : (
        <span className="mt-1 text-gray-800 font-medium">{value}</span>
      )}
    </div>
  );
};

export default function LoanDetailsModal({ isOpen, onClose, application }: LoanDetailsModalProps) {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Loan Application Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Section 1: Overview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-[#2c8068]" />
              <span className="font-semibold text-sm text-gray-700">
                Overview
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <DetailItem
                label="Loan Purpose"
                value={application.loanPurpose}
              />
              <DetailItem
                label="Loan Amount"
                value={`₱${application.loanAmount.toLocaleString()}`}
              />
              <DetailItem label="Loan Type" value={application.loanType} />
              <DetailItem label="Status" value={application.loanStatus} badge />
              <DetailItem
                label="Application Date"
                value={new Date(application.createdAt).toLocaleDateString()}
              />
            </div>
          </div>

          {/* Section 2: Personal Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-blue-400" />
              <span className="font-semibold text-sm text-gray-700">
                Personal Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <DetailItem
                label="Marital Status"
                value={application.maritalStatus}
              />
              <DetailItem
                label="Highest Education"
                value={application.highestEducation}
              />
              <DetailItem
                label="Resident Type"
                value={application.residentType}
              />
            </div>
          </div>

          {/* Section 3: Employment & Address */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-purple-400" />
              <span className="font-semibold text-sm text-gray-700">
                Employment & Address
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 bg-gray-50 rounded-lg p-4">
              <DetailItem
                label="Employment Info"
                value={application.employmentInformation}
              />
              <DetailItem label="Address" value={application.residentType} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
