"use client";
import React from "react";
import Overview from "@/components/admindashboard/client/Overview";
import Users from "@/components/admindashboard/client/Users";
import Analytics from "@/components/admindashboard/client/Analytics";
import Settings from "@/components/admindashboard/client/Settings";
import { deleteCookie } from "cookies-next";
import UserListChat from "@/components/messaging/client/UserListChat";
import { useRouter } from "next/navigation";

interface AdminDashboardLayoutProps {
  children?: React.ReactNode;
}

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const router = useRouter();

  const logout = () => {
    deleteCookie("session_token");
    deleteCookie("user_role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => scrollToSection("overview")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection("users")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Users
              </button>
              <button
                onClick={() => scrollToSection("analytics")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Analytics
              </button>
              <button
                onClick={() => scrollToSection("settings")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Settings
              </button>

              <button
                onClick={logout}
                className="text-gray-600 cursor-pointer hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>

              <UserListChat />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Overview />
          <Users />
          <Analytics />
          <Settings />
          {children}
        </div>
      </main>
    </div>
  );
}
