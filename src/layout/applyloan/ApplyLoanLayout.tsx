"use client";
import React from "react";
import NewSidebar from "@/components/dashboard/client/NewSidebar";
import LoanHeader from "@/components/applyloan/client/LoanHeader";

interface ApplyLoanLayoutProps {
  children: React.ReactNode;
}

export default function ApplyLoanLayout({ children }: ApplyLoanLayoutProps) {
  return (
    <div className="w-full h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <NewSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <LoanHeader />
        
        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
