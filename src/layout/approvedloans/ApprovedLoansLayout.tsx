"use client";
import React from "react";
import NewSidebar from "@/components/dashboard/client/NewSidebar";
import ApprovedLoansHeader from "@/components/approvedloans/client/ApprovedLoansHeader";
import ApprovedComponent from "@/components/approvedloans/client/ApprovedComponent";

export default function ApprovedLoansLayout() {
  return (
    <div className="w-full h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <NewSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ApprovedLoansHeader />
        
        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          <ApprovedComponent />
        </div>
      </div>
    </div>
  );
}
