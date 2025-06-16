"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useLogoutRequest from "@/hooks/auth/requestLogout";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";
import { BiMessage } from "react-icons/bi";
import Image from "next/image";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useLogoutRequest();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [storedUser, setStoredUser] = useState<{
    fullName?: string;
    profilePicture?: string;
    role?: string;
  }>({});

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setStoredUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        {storedUser.role === "Admin" ? (
          <Link href="/admindashboard">Dashboard</Link>
        ) : (
          <div className="flex flex-row gap-5">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/sample">Lend</Link>
            <Link href="/sample">Sample</Link>
            <Link href="/sample">Sample</Link>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-center items-center gap-5 h-full px-12 relative">
        <IoNotificationsOutline size={24} />

        {/* Profile dropdown */}
        <div
          ref={dropdownRef}
          className="flex flex-row gap-4 items-center cursor-pointer relative"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="w-8 h-8">
            <Image
              className="w-full h-full rounded-full"
              width={1920}
              height={1080}
              src={storedUser.profilePicture || "/Images/User.jpg"}
              alt="Profile Picture"
            />
          </div>
          <label>{storedUser.fullName}</label>
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
