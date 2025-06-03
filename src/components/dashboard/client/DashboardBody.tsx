"use client";
import React, { useState, useEffect } from "react";
import CreditScore from "@/components/dashboard/client/CreditScore";
import AppliedLendings, {
  Application,
} from "@/components/dashboard/client/AppliedLendings";
import useIDSelfieUploaded from "@/hooks/auth/requestIDSelfieUploaded";
import UploadIDandSelfieModal from "@/components/profile/client/UploadIDandSelfie";
import { getCookie } from "cookies-next";
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
      className={`flex w-full h-full ${
        showModal ? "opacity-90" : ""
      } flex-row gap-5 px-6 pb-6`}
    >
      {showModal && (
        <UploadIDandSelfieModal onClose={() => setShowModal(false)} />
      )}

      <div className="w-4/12 flex flex-col gap-5">
        <CreditScore />
        <AppliedLendings onSelect={setSelectedApp} />
      </div>
      <div className="w-8/12">
        {selectedApp ? (
          <div className="bg-white rounded-xl p-6 shadow-lg h-full">
            <h2 className="text-2xl font-bold mb-4">Application Details</h2>
            <p>
              <strong>Name:</strong> {selectedApp.name}
            </p>
            <p>
              <strong>Amount:</strong> {selectedApp.amount}
            </p>
            <p>
              <strong>Status:</strong> {selectedApp.status}
            </p>
            <p>
              <strong>Date:</strong> {selectedApp.date}
            </p>
            <p className="mt-4 text-gray-600">
              This section can be extended with contact info, document previews,
              credit remarks, etc.
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a loan application to view details
          </div>
        )}
      </div>
    </div>
  );
}
