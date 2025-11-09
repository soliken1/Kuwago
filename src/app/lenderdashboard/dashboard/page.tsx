import React from "react";
import LenderDashboardLayout from "@/layout/lenderdashboard/LenderDashboardLayout";
import Dashboard from "@/components/lenderdashboard/client/Dashboard";

export default function LenderDashboardPage() {
  return (
    <LenderDashboardLayout>
      <Dashboard />
    </LenderDashboardLayout>
  );
}
