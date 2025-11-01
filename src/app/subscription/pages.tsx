import React from "react";
import { redirect } from "next/navigation";

export default function SubscriptionPage() {
  // Redirect to success page by default, or you can add logic here
  redirect("/subscription/success");
}
