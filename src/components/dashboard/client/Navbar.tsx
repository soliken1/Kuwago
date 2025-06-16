"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useLogoutRequest from "@/hooks/auth/requestLogout";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";
import Image from "next/image";
import LendModal from "@/components/lend/client/LendModal";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lendOpen, setLendOpen] = useState(false);
  const { logout } = useLogoutRequest();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [storedUser, setStoredUser] = useState<{
    uid?: string;
    fullName?: string;
    profilePicture?: string;
    role?: string;
    email?: string;
  }>({});

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setStoredUser(JSON.parse(user));
  }, []);

  useEffect(() => {
    const handler = (evt: MouseEvent) => {
      !dropdownRef.current?.contains(evt.target as Node) &&
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <div className="w-full flex items-center h-16 px-6 justify-between">
        <div className="flex items-center gap-12">
          <span className="text-xl font-semibold">
            Kuwa<span className="text-green-500">Go</span>
          </span>

          {storedUser.role === "Admin" ? (
            <Link href="/admindashboard">Dashboard</Link>
          ) : (
            <div className="flex items-center gap-5">
              <Link href="/dashboard">Dashboard</Link>
              <button
                className="cursor-pointer"
                onClick={() => setLendOpen(true)}
              >
                Lend
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 relative">
          <IoNotificationsOutline size={24} />
          <div
            ref={dropdownRef}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsDropdownOpen((v) => !v)}
          >
            <Image
              src={storedUser.profilePicture || "/Images/User.jpg"}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span>{storedUser.fullName}</span>
            <IoMdArrowDropdown size={20} />
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full bg-white border rounded-md shadow-md mt-2 w-36 z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {lendOpen && (
        <LendModal
          onClose={() => setLendOpen(false)}
          currentUser={{
            id: storedUser?.uid || "No ID",
            name: storedUser?.fullName || "Unknown User",
            email: storedUser?.email || "No Email",
          }}
        />
      )}
    </>
  );
}
