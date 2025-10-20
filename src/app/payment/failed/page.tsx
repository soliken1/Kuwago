import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const PaymentFailedLayout = dynamic(
  () => import("@/layout/payment/PaymentFailedLayout"),
  { ssr: false }
);

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentFailedLayout />
    </Suspense>
  );
}
