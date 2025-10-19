"use client";
import React from "react";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({ 
  title = "Admin Dashboard", 
  subtitle = "Manage your platform and users" 
}: AdminHeaderProps) {
  return (
    <div className="bg-white px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {title}
      </h1>
      <p className="text-gray-600 text-lg">
        {subtitle}
      </p>
    </div>
  );
}
