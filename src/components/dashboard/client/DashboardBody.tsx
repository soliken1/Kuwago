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
              ? "bg-green-100 text-green-700"
              : value === "Rejected"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
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
          <div className="bg-white rounded-2xl p-8 shadow-xl h-full space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Loan Application Details
            </h2>

            {/* Section 1: Overview */}
            <div className="grid grid-cols-2 gap-4">
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
            <h3 className="text-xl font-semibold text-gray-700 mt-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
            <h3 className="text-xl font-semibold text-gray-700 mt-6">
              Employment & Address
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <DetailItem
                label="Employment Info"
                value={selectedApp.employmentInformation}
              />
              <DetailItem label="Address" value={selectedApp.residentType} />
            </div>

            {/* Optional message */}
            <p className="text-sm text-gray-500 pt-4">
              Additional verification documents, credit remarks, and reviewer
              notes can be added here.
            </p>
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
