"use client";
import React from "react";

interface NewCreditScoreProps {
  score?: number;
  status?: string;
}

export default function NewCreditScore({ 
  score = 93, 
  status = "Good" 
}: NewCreditScoreProps) {
  return (
    <div className="bg-[#2c8068] rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Text Content */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-white text-4xl font-bold mb-2">
              Credit Score
            </h2>
            <p className="text-white/90 text-lg">
              Your current credit standing
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
              View Details
            </button>
            <button className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors">
              Improve Score
            </button>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <span className="text-white text-5xl font-bold">
              {score}
            </span>
          </div>
          <div className="px-6 py-2 bg-white/20 rounded-full">
            <span className="text-white font-medium text-lg">
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
