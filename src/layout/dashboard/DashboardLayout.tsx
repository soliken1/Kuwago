"use client";
import React from "react";
import NewSidebar from "@/components/dashboard/client/NewSidebar";
import NewHeader from "@/components/dashboard/client/NewHeader";
import NewCreditScore from "@/components/dashboard/client/NewCreditScore";
import NewAppliedLendings from "@/components/dashboard/client/NewAppliedLendings";
import UserListChat from "@/components/messaging/client/UserListChat";

export default function DashboardLayout() {

  return (
    <div className="w-full h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <NewSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <NewHeader />
        
        {/* Content Area */}
        <div className="flex-1 p-8 space-y-6 overflow-auto">
          {/* Credit Score Card */}
          <NewCreditScore />
          
          {/* Applied Lendings Table */}
          <NewAppliedLendings />
        </div>
      </div>

      {/* Chat Component - Fixed positioning outside content flow */}
      <UserListChat />
    </div>
  );
}
