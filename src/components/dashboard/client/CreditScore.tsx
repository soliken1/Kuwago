import React from "react";

export default function CreditScore() {
  const score = 1000;
  const status = "Excellent";

  return (
    <div className="w-full h-1/3 p-4 bg-white rounded-xl shadow-md flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
          {score}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold">Credit Score</p>
        <p className="text-sm text-gray-500">
          Status: <span className="font-medium text-green-600">{status}</span>
        </p>
      </div>
    </div>
  );
}
