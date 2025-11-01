"use client";
import React from "react";
import SubscriptionFailed from "@/components/subscription/client/SubscriptionFailed";

export default function SubscriptionFailedLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <SubscriptionFailed />
    </div>
  );
}
