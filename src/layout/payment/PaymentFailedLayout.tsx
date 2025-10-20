"use client";
import React from "react";
import PaymentFailed from "@/components/payment/client/PaymentFailed";

export default function PaymentFailedLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <PaymentFailed />
    </div>
  );
}
