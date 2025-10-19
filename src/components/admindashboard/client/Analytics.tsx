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
import useUserGrowth from "@/hooks/admin/useUserGrowth";
import useRevenueTrend from "@/hooks/admin/useRevenueTrend";

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

export default function Analytics() {
  const { fetchUserGrowth, userGrowthData, loading, error } = useUserGrowth();
  const { fetchRevenueTrend, revenueTrendData, loading: revenueLoading, error: revenueError } = useRevenueTrend();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("monthly");
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState<PeriodType>("monthly");

  useEffect(() => {
    fetchUserGrowth(selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    fetchRevenueTrend(selectedRevenuePeriod);
  }, [selectedRevenuePeriod]);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  const handleRevenuePeriodChange = (period: PeriodType) => {
    setSelectedRevenuePeriod(period);
  };

  const getChartData = () => {
    if (!userGrowthData?.data || userGrowthData.data.length === 0) {
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

    const data = userGrowthData.data;
    const labels = data.map((item) => item.period);
    const counts = data.map((item) => item.count);

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
    if (!revenueTrendData?.data || revenueTrendData.data.length === 0) {
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

    const data = revenueTrendData.data;
    const labels = data.map((item) => item.period);
    const revenues = data.map((item) => item.revenue);

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

  const chartOptions = {
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
        text: `User Growth - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`,
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
        text: `Revenue Trends - ${selectedRevenuePeriod.charAt(0).toUpperCase() + selectedRevenuePeriod.slice(1)}`,
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

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">User Growth</h3>
            <div className="flex space-x-2">
              {(["daily", "weekly", "monthly", "yearly"] as PeriodType[]).map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-3 py-1 text-sm rounded ${
                    selectedPeriod === period
                      ? "text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  style={{
                    backgroundColor: selectedPeriod === period ? "#2c8068" : undefined
                  }}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-red-500">Error: {error}</div>
              </div>
            ) : (
              <div className="w-full h-full">
                <Line data={getChartData()} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Revenue Trends</h3>
            <div className="flex space-x-2">
              {(["daily", "weekly", "monthly", "yearly"] as PeriodType[]).map((period) => (
                <button
                  key={period}
                  onClick={() => handleRevenuePeriodChange(period)}
                  className={`px-3 py-1 text-sm rounded ${
                    selectedRevenuePeriod === period
                      ? "text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  style={{
                    backgroundColor: selectedRevenuePeriod === period ? "#2c8068" : undefined
                  }}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            {revenueLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Loading revenue data...</div>
              </div>
            ) : revenueError ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-red-500">Error: {revenueError}</div>
              </div>
            ) : (
              <div className="w-full h-full">
                <Bar data={getRevenueChartData()} options={revenueChartOptions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
