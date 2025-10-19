"use client";
import React, { useEffect } from "react";
import useAdminAnalytics from "@/hooks/admin/useAdminAnalytics";

export default function Overview() {
  const { fetchAnalytics, analyticsData, loading, error } = useAdminAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading analytics: {error}</p>
        </div>
      </div>
    );
  }

  const data = analyticsData?.data;

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold" style={{ color: '#85d4a4' }}>
            {data?.TotalUsers?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Active Loans</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data?.ActiveLoans?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${data?.TotalRevenue?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
    </div>
  );
}
