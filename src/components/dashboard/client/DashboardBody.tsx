"use client";
import React, { useState, useEffect } from "react";
import CreditScore from "@/components/dashboard/client/CreditScore";
import AppliedLendings from "@/components/dashboard/client/AppliedLendings";
import useIDSelfieUploaded from "@/hooks/auth/requestIDSelfieUploaded";
import UploadIDandSelfieModal from "@/components/profile/client/UploadIDandSelfie";
import { getCookie } from "cookies-next";
import UserListChat from "@/components/messaging/client/UserListChat";
import { Application } from "@/types/lendings";

const DetailItem = ({
  label,
  value,
  badge = false,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      {badge ? (
        <span
          className={`mt-1 inline-block w-fit px-3 py-1 text-sm rounded-full font-medium ${
            value === "Approved"
              ? "bg-green-100 text-green-700 border border-green-300"
              : value === "Denied"
              ? "bg-red-100 text-red-700 border border-red-300"
              : value === "InProgress"
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : value === "Completed"
              ? "bg-gray-100 text-gray-700 border border-gray-300"
              : "bg-yellow-100 text-yellow-700 border border-yellow-300"
          }`}
        >
          {value}
        </span>
      ) : (
        <span className="mt-1 text-gray-800 font-medium">{value}</span>
      )}
    </div>
  );
};

export default function DashboardBody() {
  const { forceVerificationModal } = useIDSelfieUploaded();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const role = getCookie("user_role");
    if (forceVerificationModal && role === "Borrower") {
      setShowModal(true);
    }
  }, [forceVerificationModal]);

  return (
    <div
      className={`flex w-full relative h-full ${
        showModal ? "opacity-90" : ""
      } flex-row gap-5 px-6 pb-6`}
    >
      {showModal && (
        <UploadIDandSelfieModal onClose={() => setShowModal(false)} />
      )}

      <UserListChat />

      <div className="w-4/12 flex flex-col gap-5">
        <CreditScore />
        <AppliedLendings onSelect={setSelectedApp} />
      </div>

      <div className="w-8/12">
        {selectedApp ? (
          <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 px-6 py-4 space-y-4 poppins-normal">
            <h2 className="poppins-bold text-xl text-center text-gray-700 mb-2 tracking-tight">
              Loan Application Details
            </h2>

            {/* Section 1: Overview */}
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-5 rounded bg-green-400" />
              <span className="poppins-semibold text-sm text-gray-700">
                Overview
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-white/80 rounded-lg p-3 shadow-sm">
              <DetailItem
                label="Loan Purpose"
                value={selectedApp.loanPurpose}
              />
              <DetailItem
                label="Loan Amount"
                value={`₱${selectedApp.loanAmount.toLocaleString()}`}
              />
              <DetailItem label="Loan Type" value={selectedApp.loanType} />
              <DetailItem label="Status" value={selectedApp.loanStatus} badge />
              <DetailItem
                label="Application Date"
                value={new Date(selectedApp.createdAt).toLocaleDateString()}
              />
            </div>

            {/* Section 2: Personal Info */}
            <div className="flex items-center gap-2 mt-4 mb-1">
              <span className="inline-block w-2 h-5 rounded bg-blue-400" />
              <span className="poppins-semibold text-sm text-gray-700">
                Personal Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-white/80 rounded-lg p-3 shadow-sm">
              <DetailItem
                label="Marital Status"
                value={selectedApp.maritalStatus}
              />
              <DetailItem
                label="Highest Education"
                value={selectedApp.highestEducation}
              />
              <DetailItem
                label="Resident Type"
                value={selectedApp.residentType}
              />
            </div>

            {/* Section 3: Employment + Address */}
            <div className="flex items-center gap-2 mt-4 mb-1">
              <span className="inline-block w-2 h-5 rounded bg-purple-400" />
              <span className="poppins-semibold text-sm text-gray-700">
                Employment & Address
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 bg-white/80 rounded-lg p-3 shadow-sm">
              <DetailItem
                label="Employment Info"
                value={selectedApp.employmentInformation}
              />
              <DetailItem label="Address" value={selectedApp.residentType} />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            Select a loan application to view details.
          </div>
        )}
      </div>
    </div>
  );
}
