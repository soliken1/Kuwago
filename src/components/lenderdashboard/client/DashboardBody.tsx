"use client";
import React, { useState } from "react";

import UserListChat from "@/components/messaging/client/UserListChat";
export default function DashboardBody() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className={`flex w-full relative h-full ${
        showModal ? "opacity-90" : ""
      } flex-row gap-5 px-6 pb-6`}
    >
      <UserListChat />

      <div className="w-8/12"></div>
    </div>
  );
}
