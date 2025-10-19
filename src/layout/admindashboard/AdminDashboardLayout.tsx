"use client";
import React from "react";
import AdminSidebar from "@/components/admindashboard/client/AdminSidebar";
import AdminHeader from "@/components/admindashboard/client/AdminHeader";
import UserListChat from "@/components/messaging/client/UserListChat";

interface AdminDashboardLayoutProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminDashboardLayout({
  children,
  title = "Admin Dashboard",
  subtitle = "Manage your platform and users"
}: AdminDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-80">
        {/* Header */}
        <AdminHeader title={title} subtitle={subtitle} />

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
