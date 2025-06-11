import React from "react";
import Navbar from "@/components/dashboard/client/Navbar";
import ChatComponent from "@/components/messaging/client/ChatComponent";
export default function MessagingLayout() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <ChatComponent />
    </div>
  );
}
