import React from "react";

interface CreditScoreProps {
  score?: number;
  status?: string;
}

export default function CreditScore({
  score = 100,
  status = "Excellent",
}: CreditScoreProps) {
  // Arc settings
  const arcRadius = 90;
  const arcStroke = 18;
  const arcCircumference = Math.PI * arcRadius; // Only half circle
  const arc = arcCircumference / 3;
  const centerX = 112;
  const centerY = 112;
  const arcStartY = centerY + arcRadius;
  // Helper to describe an arc path (SVG arc command)
  const describeArc = (startAngle: number, endAngle: number, color: string) => {
    const start = {
      x: centerX + arcRadius * Math.cos(Math.PI + startAngle),
      y: centerY + arcRadius * Math.sin(Math.PI + startAngle),
    };
    const end = {
      x: centerX + arcRadius * Math.cos(Math.PI + endAngle),
      y: centerY + arcRadius * Math.sin(Math.PI + endAngle),
    };
    return (
      <path
        d={`M ${start.x} ${start.y} A ${arcRadius} ${arcRadius} 0 0 1 ${end.x} ${end.y}`}
        stroke={color}
        strokeWidth={arcStroke}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className="w-full max-w p-4 bg-white rounded-xl shadow-md flex flex-col items-center gap-2">
      {/* Title above the arc */}
      <span className="text-xl font-bold text-gray-700 mb-1 poppins-normal">
        Credit Score
      </span>
      <div className="relative w-56 h-32 flex items-center justify-center">
        <svg width="224" height="112">
          {/* Green arc: left third */}
          {describeArc(0, Math.PI / 3, "#ef4444")}
          {/* Yellow arc: middle third */}
          {describeArc(Math.PI / 3, (2 * Math.PI) / 3, "#eab308")}
          {/* Red arc: right third */}
          {describeArc((2 * Math.PI) / 3, Math.PI, "#22c55e")}
        </svg>
        {/* Score in the center below the arc */}
        <div className="absolute left-0 right-0 top-16 flex flex-col items-center">
          <span className="text-5xl font-bold text-gray-700">{score}</span>
        </div>
      </div>
      {/* Status below the score, with green-200 bg */}
      <span className="mt-2 px-4 py-1 rounded-full bg-green-200 text-green-800 text-sm font-semibold">
        {status}
      </span>
    </div>
  );
}
