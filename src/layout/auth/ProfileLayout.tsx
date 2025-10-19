"use client";
import React, { ReactNode, useState, useEffect } from "react";
import NewSidebar from "@/components/dashboard/client/NewSidebar";
import AdminSidebar from "@/components/admindashboard/client/AdminSidebar";
import LenderSidebar from "@/components/lenderdashboard/client/NewSidebar";
import ProfileHeader from "@/components/profile/client/ProfileHeader";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role || "");
    }
  }, []);

  const renderSidebar = () => {
    switch (userRole) {
      case "Admin":
        return <AdminSidebar />;
      case "Lenders":
        return <LenderSidebar />;
      case "Borrower":
      default:
        return <NewSidebar />;
    }
  };

  return (
    <div className="w-full h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        {renderSidebar()}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ProfileHeader />
        
        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
