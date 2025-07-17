import React from "react";

export default function CreditScore() {
  // Static values for demonstration
  const score = 93;
  const status = "Good";

  // SVG circle settings
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Progress calculation (score out of 100)
  const progress = score / 100;
  const offset = circumference * (1 - progress);

  return (
    <div
      className="flex items-center bg-white rounded-2xl shadow-lg p-8"
      style={{ minWidth: 420 }}
    >
      {/* Circle and number */}
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#bbf7d0"
            strokeWidth={strokeWidth}
          />
          {/* Foreground arc (progress) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#22c55e"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transform: "rotate(-90deg) scale(-1, 1)",
              transformOrigin: "50% 50%",
              transition: "stroke-dashoffset 0.5s",
            }}
          />
        </svg>
        {/* Score number */}
        <span className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center text-4xl font-extrabold text-black">
          {score}
        </span>
      </div>
      {/* Text content */}
      <div className="flex flex-col justify-center items-center ml-12 gap-2">
        <span className="text-3xl poppins-normal tracking-widest">
          Credit Score
        </span>
        <span className="px-8 py-2 rounded-full bg-green-100 text-black text-xl font-normal border border-green-300 text-center">
          {status}
        </span>
      </div>
    </div>
  );
}
