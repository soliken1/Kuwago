import React from "react";
import Navbar from "@/components/dashboard/client/Navbar";
import DashboardBody from "@/components/lenderdashboard/client/DashboardBody";

export default function DashboardLayout() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <DashboardBody />
    </div>
  );
}
