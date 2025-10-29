"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoLogOutOutline } from "react-icons/io5";
import useLogoutRequest from "@/hooks/auth/requestLogout";
import { useUserData } from "@/hooks/users/useUserData";
import KuwagoLogo from "../../../../assets/images/KuwagoLogoWhite.png";

export default function NewSidebar() {
  const { storedUser } = useUserData();
  const { logout } = useLogoutRequest();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "Borrower":
        return "Borrower";
      case "Lenders":
        return "Lender";
      case "Admin":
        return "Admin";
      default:
        return "User";
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#2c8068] flex flex-col">
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
            {storedUser.fullName || "User Name"}
          </span>
          <span className="text-white/80 text-sm">
            {getRoleDisplayName(storedUser.role || "User")}
          </span>
        </div>
      </Link>

      {/* Divider */}
      <div className="border-b border-white/20 mx-6"></div>

      {/* Navigation Items */}
      <div className="flex-1 px-6 py-6">
        <div className="space-y-2">
          <Link
            href="/lenderdashboard"
            className="block px-4 py-3 text-white text-lg font-medium hover:bg-white/20 rounded-lg transition-colors"
          >
            Dashboard
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
