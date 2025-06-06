import React from "react";
import Navbar from "@/components/dashboard/client/Navbar";
import ProfileForm from "@/components/profile/client/ProfileForm";
export default function ProfileLayout() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <ProfileForm />
    </div>
  );
}
