"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useLogoutRequest from "@/hooks/auth/requestLogout";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useLogoutRequest();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="w-full flex flex-row h-16 px-6 items-center justify-between">
      <div className="flex flex-row items-center gap-12">
        <label className="text-xl font-semibold">
          Kuwa<span className="text-green-500">Go</span>
        </label>
        <div className="flex flex-row gap-5">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/sample">Lend</Link>
          <Link href="/sample">Sample</Link>
          <Link href="/sample">Sample</Link>
        </div>
      </div>

      <div className="flex flex-row items-center gap-5 h-full px-12 relative">
        <IoNotificationsOutline size={24} />

        {/* Profile dropdown */}
        <div
          className="flex flex-row gap-4 items-center cursor-pointer relative"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br to-green-300 from-green-200"></div>
          <label>Kenneth James Macas</label>
          <IoMdArrowDropdown size={24} />

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-300 rounded-md shadow-md py-2 w-36 z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
