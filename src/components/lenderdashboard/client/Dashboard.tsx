"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import useLenderKPI from "@/hooks/lend/useLenderKPI";
import { useUserData } from "@/hooks/users/useUserData";
import useBorrowerPastDues from "@/hooks/lend/useBorrowerPastDues";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

export default function Dashboard() {
  const { storedUser } = useUserData();
  
  // Separate hooks for each chart
  const { 
    fetchLenderKPI: fetchUserTrend, 
    kpiData: userTrendData, 
    loading: userTrendLoading, 
    error: userTrendError 
  } = useLenderKPI();
  
  const { 
    fetchLenderKPI: fetchRevenueTrend, 
    kpiData: revenueTrendData, 
    loading: revenueTrendLoading, 
    error: revenueTrendError 
  } = useLenderKPI();

  const { 
    fetchBorrowerPastDues, 
    pastDuesData, 
    loading: pastDuesLoading, 
    error: pastDuesError 
  } = useBorrowerPastDues();

  // Separate period states for each chart
  const [userTrendPeriod, setUserTrendPeriod] = useState<PeriodType>("monthly");
  const [revenueTrendPeriod, setRevenueTrendPeriod] = useState<PeriodType>("monthly");

  // Initial load - fetch both with default periods
  useEffect(() => {
    if (storedUser?.uid) {
      fetchUserTrend(storedUser.uid, userTrendPeriod);
      fetchRevenueTrend(storedUser.uid, revenueTrendPeriod);
      fetchBorrowerPastDues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedUser?.uid]);

  // Fetch user trend when its period changes
  useEffect(() => {
    if (storedUser?.uid) {
      fetchUserTrend(storedUser.uid, userTrendPeriod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTrendPeriod]);

  // Fetch revenue trend when its period changes
  useEffect(() => {
    if (storedUser?.uid) {
      fetchRevenueTrend(storedUser.uid, revenueTrendPeriod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revenueTrendPeriod]);

  const handleUserTrendPeriodChange = (period: PeriodType) => {
    setUserTrendPeriod(period);
  };

  const handleRevenueTrendPeriodChange = (period: PeriodType) => {
    setRevenueTrendPeriod(period);
  };

  const getUserTrendChartData = () => {
    const data = userTrendData;
    if (!data?.UserTrend || data.UserTrend.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            label: "User Growth",
            data: [0],
            borderColor: "#2c8068",
            backgroundColor: "rgba(44, 128, 104, 0.1)",
            tension: 0.1,
          },
        ],
      };
    }

    const labels = data.UserTrend.map((item) => item.period);
    const counts = data.UserTrend.map((item) => item.totalUsers);

    return {
      labels,
      datasets: [
        {
          label: "User Growth",
          data: counts,
          borderColor: "#2c8068",
          backgroundColor: "rgba(44, 128, 104, 0.1)",
          tension: 0.1,
          fill: true,
          pointBackgroundColor: "#2c8068",
          pointBorderColor: "#2c8068",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const getRevenueChartData = () => {
    const data = revenueTrendData;
    if (!data?.RevenueTrend || data.RevenueTrend.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            label: "Revenue",
            data: [0],
            backgroundColor: "#2c8068",
            borderColor: "#2c8068",
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = data.RevenueTrend.map((item) => item.period);
    const revenues = data.RevenueTrend.map((item) => item.revenue);

    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenues,
          backgroundColor: "#2c8068",
          borderColor: "#2c8068",
          borderWidth: 1,
        },
      ],
    };
  };

  const userTrendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: "top" as const,
        display: true,
      },
      title: {
        display: true,
        text: `User Growth Trend - ${userTrendPeriod.charAt(0).toUpperCase() + userTrendPeriod.slice(1)}`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Period',
        },
      },
      y: {
        beginAtZero: true,
        display: true,
        title: {
          display: true,
          text: 'User Count',
        },
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
    elements: {
      line: {
        tension: 0.1,
      },
    },
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: "top" as const,
        display: true,
      },
      title: {
        display: true,
        text: `Revenue Trends - ${revenueTrendPeriod.charAt(0).toUpperCase() + revenueTrendPeriod.slice(1)}`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `Revenue: ₱${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Period',
        },
      },
      y: {
        beginAtZero: true,
        display: true,
        title: {
          display: true,
          text: 'Revenue (₱)',
        },
        ticks: {
          callback: function(value: any) {
            return '₱' + value.toLocaleString();
          }
        },
      },
    },
  };

  // Use the first available data for overview cards (prefer userTrendData, fallback to revenueTrendData)
  const overviewData = userTrendData || revenueTrendData;
  
  // Initial loading state (only show full screen loading on first load)
  const [initialLoad, setInitialLoad] = useState(true);
  
  useEffect(() => {
    if (storedUser?.uid && (userTrendData || revenueTrendData)) {
      setInitialLoad(false);
    }
  }, [storedUser?.uid, userTrendData, revenueTrendData]);

  if (initialLoad && (userTrendLoading || revenueTrendLoading)) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-md animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-md animate-pulse"
            >
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if ((userTrendError || revenueTrendError) && !userTrendData && !revenueTrendData) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">
            Error loading dashboard: {userTrendError || revenueTrendError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold" style={{ color: "#85d4a4" }}>
            {overviewData?.TotalUsers?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">
            ₱{overviewData?.TotalRevenue?.toLocaleString() || "0"}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">User Growth Trend</h3>
            <div className="flex space-x-2">
              {(["daily", "weekly", "monthly", "yearly"] as PeriodType[]).map((period) => (
                <button
                  key={period}
                  onClick={() => handleUserTrendPeriodChange(period)}
                  disabled={userTrendLoading}
                  className={`px-3 py-1 text-sm rounded ${
                    userTrendPeriod === period
                      ? "text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } ${userTrendLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{
                    backgroundColor: userTrendPeriod === period ? "#2c8068" : undefined
                  }}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 relative">
            {userTrendLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : userTrendError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-red-500 text-sm">Error: {userTrendError}</div>
              </div>
            ) : null}
            <Line data={getUserTrendChartData()} options={userTrendChartOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Revenue Trends</h3>
            <div className="flex space-x-2">
              {(["daily", "weekly", "monthly", "yearly"] as PeriodType[]).map((period) => (
                <button
                  key={period}
                  onClick={() => handleRevenueTrendPeriodChange(period)}
                  disabled={revenueTrendLoading}
                  className={`px-3 py-1 text-sm rounded ${
                    revenueTrendPeriod === period
                      ? "text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } ${revenueTrendLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{
                    backgroundColor: revenueTrendPeriod === period ? "#2c8068" : undefined
                  }}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 relative">
            {revenueTrendLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : revenueTrendError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-red-500 text-sm">Error: {revenueTrendError}</div>
              </div>
            ) : null}
            <Bar data={getRevenueChartData()} options={revenueChartOptions} />
          </div>
        </div>
      </div>

      {/* Default Users List */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Default Users</h3>
        {pastDuesLoading ? (
          <div className="text-gray-500 py-4">Loading past due users...</div>
        ) : pastDuesError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">Error: {pastDuesError}</p>
          </div>
        ) : pastDuesData.length === 0 ? (
          <div className="text-gray-500 py-4">No users with past due payments.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Per Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue Schedules
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastDuesData.map((borrower, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {borrower.borrowerFullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {borrower.businessName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₱{borrower.paymentPerMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-2">
                        {borrower.overdueSchedules.map((schedule, scheduleIndex) => (
                          <span
                            key={scheduleIndex}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {new Date(schedule).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

