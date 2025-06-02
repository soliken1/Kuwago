"use client";
import React from "react";

export default function Analytics() {
  return (
    <section id="analytics" className="min-h-screen py-8">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            Chart Placeholder
          </div>
        </div>
      </div>
    </section>
  );
}
