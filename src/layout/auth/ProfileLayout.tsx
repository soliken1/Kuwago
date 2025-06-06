import React, { ReactNode } from "react";
import Navbar from "@/components/dashboard/client/Navbar";
import ProfileForm from "@/components/profile/client/ProfileForm";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
