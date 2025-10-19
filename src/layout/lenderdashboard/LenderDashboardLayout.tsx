import React from "react";
import NewHeader from "@/components/lenderdashboard/client/NewHeader";
import NewSidebar from "@/components/lenderdashboard/client/NewSidebar";
import DashboardBody from "@/components/lenderdashboard/client/DashboardBody";
import UserListChat from "@/components/messaging/client/UserListChat";

export default function LenderDashboardLayout() {
  return (
    <div className="w-screen h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <NewSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <NewHeader />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <DashboardBody />
        </div>
      </div>

      {/* Chat Component - Fixed positioning outside content flow */}
      <UserListChat />
    </div>
  );
}
