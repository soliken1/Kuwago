"use client";
import React, { ReactNode, useEffect, useState } from "react";
import NewHeader from "@/components/lenderdashboard/client/NewHeader";
import NewSidebar from "@/components/lenderdashboard/client/NewSidebar";
import DashboardBody from "@/components/lenderdashboard/client/DashboardBody";
import UserListChat from "@/components/messaging/client/UserListChat";
import useIDSelfieUploaded from "@/hooks/auth/requestIDSelfieUploaded";
import useCheckDocuments from "@/hooks/auth/requestCheckDocuments";
import UploadIDandSelfieModal from "@/components/profile/client/UploadIDandSelfie";
import LegalDocumentsUploadModal from "@/components/profile/client/LegalDocumentsUpload";
import { getCookie } from "cookies-next";

interface LenderDashboardLayoutProps {
  children?: ReactNode;
}

export default function LenderDashboardLayout({ children }: LenderDashboardLayoutProps) {
  const { forceVerificationModal } = useIDSelfieUploaded();
  const { forceDocumentModal } = useCheckDocuments();
  const [showIdModal, setShowIdModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    const role = getCookie("user_role");
    if (role === "Lenders") {
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
      className={`w-screen h-screen flex bg-gray-50 relative ${
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <NewHeader />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children || <DashboardBody />}
        </div>
      </div>

      {/* Chat Component - Fixed positioning outside content flow */}
      {!showIdModal && !showDocumentModal && <UserListChat />}
    </div>
  );
}
