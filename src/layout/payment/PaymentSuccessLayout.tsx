"use client";
import React from "react";
import PaymentSuccess from "@/components/payment/client/PaymentSuccess";

export default function PaymentSuccessLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <PaymentSuccess />
    </div>
  );
}
