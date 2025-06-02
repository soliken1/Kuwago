import React from "react";
import Navbar from "@/components/dashboard/client/Navbar";
import UploadIDandSelfie from "@/components/profile/client/UploadIDandSelfie";
export default function ProfileLayout() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <UploadIDandSelfie />
    </div>
  );
}
