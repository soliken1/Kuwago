"use client";
import React from "react";

export interface Application {
  id: number;
  name: string;
  amount: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

const applications: Application[] = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    amount: "₱15,000",
    status: "Pending",
    date: "May 30, 2025",
  },
  {
    id: 2,
    name: "Maria Santos",
    amount: "₱25,000",
    status: "Approved",
    date: "May 25, 2025",
  },
  {
    id: 3,
    name: "Carlos Reyes",
    amount: "₱10,000",
    status: "Rejected",
    date: "May 20, 2025",
  },
];

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-600",
  Approved: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-600",
};

interface Props {
  onSelect: (app: Application) => void;
}

export default function AppliedLendings({ onSelect }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          onClick={() => onSelect(app)}
          className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-1 cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">{app.name}</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColor[app.status]
              }`}
            >
              {app.status}
            </span>
          </div>
          <p className="text-gray-600 text-sm">Amount: {app.amount}</p>
          <p className="text-gray-500 text-xs">Applied: {app.date}</p>
        </div>
      ))}
    </div>
  );
}
