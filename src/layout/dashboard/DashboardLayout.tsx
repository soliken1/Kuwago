"use client";
import React, { useEffect, useState } from "react";
import NewSidebar from "@/components/dashboard/client/NewSidebar";
import NewHeader from "@/components/dashboard/client/NewHeader";
import NewCreditScore from "@/components/dashboard/client/NewCreditScore";
import NewAppliedLendings from "@/components/dashboard/client/NewAppliedLendings";
import UserListChat from "@/components/messaging/client/UserListChat";
import useCreditScore, { CreditScoreData } from "@/hooks/users/useCreditScore";

export default function DashboardLayout() {
  const { fetchCreditScore, creditScoreData, creditScoreCategory, loading } = useCreditScore();
  const [userData, setUserData] = useState<{ uid?: string } | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
      
      // Fetch credit score
      if (parsedUser.uid) {
        fetchCreditScore(parsedUser.uid);
      }
    }
  }, []);

  return (
    <div className="w-full h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <NewSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <NewHeader />
        
        {/* Content Area */}
        <div className="flex-1 p-8 space-y-6 overflow-auto">
          {/* Credit Score Card */}
          <NewCreditScore 
            creditScoreData={creditScoreData}
            creditScoreCategory={creditScoreCategory}
            loading={loading}
          />
          
          {/* Applied Lendings Table */}
          <NewAppliedLendings />
        </div>
      </div>

      {/* Chat Component - Fixed positioning outside content flow */}
      <UserListChat />
    </div>
  );
}
