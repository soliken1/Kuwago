"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { IoLogOutOutline } from "react-icons/io5";
import { deleteCookie } from "cookies-next";
import KuwagoLogo from "../../../../assets/images/KuwagoLogoWhite.png";

export default function AdminSidebar() {
  const [storedUser, setStoredUser] = useState<{
    uid?: string;
    fullName?: string;
    profilePicture?: string;
    role?: string;
    email?: string;
  }>({});
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setStoredUser(JSON.parse(user));
  }, []);

  const handleLogout = async () => {
    deleteCookie("session_token");
    deleteCookie("user_role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "Admin":
        return "Admin";
      default:
        return "Administrator";
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-80 h-screen bg-[#2c8068] flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="flex items-center justify-center py-4 bg-black/20">
        <Image
          src={KuwagoLogo}
          alt="KuwaGo Logo"
          width={120}
          height={40}
          style={{ objectFit: "contain", background: "transparent" }}
          priority
        />
      </div>

      {/* User Profile Section */}
      <Link
        href="/profile"
        className="flex items-center gap-4 px-6 py-6 hover:bg-white/10 rounded-lg mx-4 transition-colors cursor-pointer"
      >
        <Image
          src={storedUser.profilePicture || "/Images/User.jpg"}
          alt="Profile"
          width={60}
          height={60}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-white text-lg font-semibold">
            {storedUser.fullName || "Admin User"}
          </span>
          <span className="text-white/80 text-sm">
            {getRoleDisplayName(storedUser.role || "Admin")}
          </span>
        </div>
      </Link>

      {/* Divider */}
      <div className="border-b border-white/20 mx-6"></div>

      {/* Navigation Items */}
      <div className="flex-1 px-6 py-6">
        <div className="space-y-2">
          <Link
            href="/admindashboard"
            className={`block px-4 py-3 text-white text-lg font-medium hover:bg-white/20 rounded-lg transition-colors ${
              isActive("/admindashboard") ? "bg-white/20" : ""
            }`}
          >
            Overview
          </Link>
          <Link
            href="/admindashboard/users"
            className={`block px-4 py-3 text-white text-lg font-medium hover:bg-white/20 rounded-lg transition-colors ${
              isActive("/admindashboard/users") ? "bg-white/20" : ""
            }`}
          >
            Users
          </Link>
          <Link
            href="/admindashboard/analytics"
            className={`block px-4 py-3 text-white text-lg font-medium hover:bg-white/20 rounded-lg transition-colors ${
              isActive("/admindashboard/analytics") ? "bg-white/20" : ""
            }`}
          >
            Analytics
          </Link>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6 py-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white text-lg font-medium hover:bg-white/20 rounded-lg transition-colors"
        >
          <IoLogOutOutline size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
