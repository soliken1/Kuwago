"use client";
import React, { useEffect, useState } from "react";
import NewSidebar from "@/components/dashboard/client/NewSidebar";
import NewHeader from "@/components/dashboard/client/NewHeader";
import NewCreditScore from "@/components/dashboard/client/NewCreditScore";
import NewAppliedLendings from "@/components/dashboard/client/NewAppliedLendings";
import UserListChat from "@/components/messaging/client/UserListChat";
import useCreditScore, { CreditScoreData } from "@/hooks/users/useCreditScore";
import useIDSelfieUploaded from "@/hooks/auth/requestIDSelfieUploaded";
import useCheckDocuments from "@/hooks/auth/requestCheckDocuments";
import UploadIDandSelfieModal from "@/components/profile/client/UploadIDandSelfie";
import LegalDocumentsUploadModal from "@/components/profile/client/LegalDocumentsUpload";
import { getCookie } from "cookies-next";
import { Application } from "@/types/lendings";

export default function DashboardLayout() {
  const {
    fetchCreditScore,
    creditScoreData,
    creditScoreCategory,
    aiAssessment,
    loading,
  } = useCreditScore();
  const { forceVerificationModal } = useIDSelfieUploaded();
  const { forceDocumentModal } = useCheckDocuments();
  const [userData, setUserData] = useState<{ uid?: string } | null>(null);
  const [userLoans, setUserLoans] = useState<Application[] | null>(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);

      // Fetch credit score
      if (parsedUser.uid) {
        fetchCreditScore(parsedUser.uid);
      }
    }
  }, []);

  useEffect(() => {
    const role = getCookie("user_role");
    if (role === "Borrower") {
      // Priority logic: If both ID verification and documents are 404, show ID modal only
      // If only documents are 404, show document modal
      if (forceVerificationModal && forceDocumentModal) {
        // Both are 404 - show ID verification modal only (which leads to document modal)
        setShowIdModal(true);
        setShowDocumentModal(false); // Explicitly prevent document modal
      } else if (forceDocumentModal && !forceVerificationModal) {
        // Only documents are 404 - show document modal directly
        setShowDocumentModal(true);
        setShowIdModal(false); // Explicitly prevent ID modal
      } else if (forceVerificationModal && !forceDocumentModal) {
        // Only ID verification is 404 - show ID modal
        setShowIdModal(true);
        setShowDocumentModal(false); // Explicitly prevent document modal
      }
    }
  }, [forceVerificationModal, forceDocumentModal]);

  return (
    <div
      className={`w-full h-screen flex bg-gray-50 relative ${
        showIdModal || showDocumentModal ? "opacity-90" : ""
      }`}
    >
      {showIdModal && (
        <UploadIDandSelfieModal onClose={() => setShowIdModal(false)} />
      )}
      {showDocumentModal && (
        <LegalDocumentsUploadModal onClose={() => setShowDocumentModal(false)} />
      )}

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <NewSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <NewHeader userLoans={userLoans} />

        {/* Content Area */}
        <div className="flex-1 p-8 space-y-6 overflow-auto">
          {/* Credit Score Card */}
          <NewCreditScore
            creditScoreData={creditScoreData}
            creditScoreCategory={creditScoreCategory}
            aiAssessment={aiAssessment}
            loading={loading}
          />

          {/* Applied Lendings Table */}
          <NewAppliedLendings setUserLoans={setUserLoans} />
        </div>
      </div>

      {/* Chat Component - Fixed positioning outside content flow */}
      {!showIdModal && !showDocumentModal && <UserListChat />}
    </div>
  );
}
