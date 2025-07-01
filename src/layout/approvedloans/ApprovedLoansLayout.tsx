import React from "react";
import Navbar from "@/components/dashboard/client/Navbar";
import ApprovedComponent from "@/components/approvedloans/client/ApprovedComponent";

export default function DashboardLayout() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <ApprovedComponent />
    </div>
  );
}
