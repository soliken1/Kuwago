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

              {storedUser.role === "Lenders" ? null : (
                <button className="cursor-pointer" onClick={handleLendClick}>
                  Lend
                </button>
              )}
            </div>
          )}
        </div>

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
            <span>{storedUser.fullName}</span>
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
    </>
  );
}
