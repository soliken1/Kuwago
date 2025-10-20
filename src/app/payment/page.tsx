import React from "react";
import { redirect } from "next/navigation";

export default function PaymentPage() {
  // Redirect to success page by default, or you can add logic here
  redirect("/payment/success");
}
