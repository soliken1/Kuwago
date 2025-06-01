"use client";
import React, { useState } from "react";
import useLogoutRequest from "@/hooks/auth/requestLogout";

export default function LogoutBtn() {
  const { logout, loading, error, logoutData } = useLogoutRequest();

  return (
    <button
      onClick={logout}
      className="absolute cursor-pointer bottom-12 right-12 w-32 h-12 border border-gray-400"
    >
      Logout
    </button>
  );
}
