"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useLogoutRequest from "@/hooks/auth/requestLogout";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";
import Image from "next/image";
import LendModal from "@/components/lend/client/LendModal";
import useGetLenderUsers from "@/hooks/users/requestLenderUsers";
import KuwagoLogo from "../../../../assets/images/KuwagoLogo.png";

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

  const {
    lenderUsers,
    lendersData,
    loading: isLoadingLenders,
  } = useGetLenderUsers();
  const [hasFetchedLenders, setHasFetchedLenders] = useState(false);

  const handleLendClick = async () => {
    if (!hasFetchedLenders) {
      await lenderUsers();
      setHasFetchedLenders(true);
    }
    setLendOpen(true);
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setStoredUser(JSON.parse(user));
  }, []);

  useEffect(() => {
    const handleClickOutside = (evt: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(evt.target as Node)
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
    <div className="w-full flex items-center h-20 px-8 justify-between">
      {/* Logo on the far left */}
      <div className="flex-shrink-0 flex items-center h-full">
        <Image
          src={KuwagoLogo}
          alt="KuwaGo Logo"
          width={120}
          height={40}
          style={{ objectFit: "contain", background: "transparent" }}
          priority
        />
      </div>
      {/* Main navbar container aligned to flex-end */}
      <div
        className="flex-1 flex justify-end poppins-normal"
        style={{ minWidth: 0 }}
      >
        <div
          className="flex items-center h-12 bg-[#F9F9F9] rounded-full shadow-md px-6 gap-16 justify-between w-full"
          style={{ minWidth: 600, maxWidth: 900 }}
        >
          {/* Navigation section (left) */}
          <div className="flex items-center gap-3 mr-8">
            {storedUser.role === "Admin" ? (
              <Link
                href="/admindashboard"
                className="px-4 py-1 rounded-full text-gray-700 text-sm font-medium shadow-sm border border-transparent transition"
                style={{ backgroundColor: '#f0f9f4' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6bc48a'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f0f9f4'}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-1 rounded-full  text-gray-700 text-sm font-medium  hover:text-lg ease-in-out duration-200"
                >
                  Dashboard
                </Link>
                {storedUser.role === "Lenders" ? null : (
                  <>
                    <button
                      className="px-4 py-1 rounded-full  text-gray-700 text-sm font-medium  hover:text-lg ease-in-out duration-200 "
                      onClick={handleLendClick}
                    >
                      Lend
                    </button>
                    <Link
                      href="/approvedloans"
                      className="px-4 py-1 rounded-full text-gray-700 text-sm font-medium  hover:text-lg ease-in-out duration-200"
                    >
                      Approved Loans
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
          {/* Notification and user info (right) */}
          <div className="flex items-center gap-5 relative" ref={dropdownRef}>
            <IoNotificationsOutline size={24} />
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <Image
                src={storedUser.profilePicture || "/Images/User.jpg"}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-medium text-gray-700">
                {storedUser.fullName}
              </span>
              <IoMdArrowDropdown size={20} />
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 bg-white border rounded-md shadow-md w-36 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
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
          lendersData={lendersData}
          loading={isLoadingLenders}
        />
      )}
    </div>
  );
}
