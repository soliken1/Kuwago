import React from "react";
import Navbar from "@/components/dashboard/client/Navbar";
import DashboardBody from "@/components/dashboard/client/DashboardBody";

export default function DashboardLayout() {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#D4FFE4]">
      <Navbar />
      <DashboardBody />
    </div>
  );
}
