"use client";
import React, { useEffect, useState } from "react";
import { useFetchUserLoans } from "@/hooks/lend/requestUserLoan";
import { Application } from "@/types/lendings";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-300",
  Approved: "text-center",
  Denied: "bg-red-100 text-red-700 border border-red-300",
  Completed: "bg-gray-100 text-gray-700 border border-gray-300",
};

const statusStyle = {
  Approved: { backgroundColor: '#f0f9f4', color: '#2d5a3d', border: '1px solid #85d4a4' }
};

interface Props {
  onSelect: (app: Application) => void;
}

const ITEMS_PER_PAGE = 3;

export default function AppliedLendings({ onSelect }: Props) {
  const { getUserLoans, loading, error } = useFetchUserLoans();
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLoans = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      try {
        const { uid } = JSON.parse(storedUser);
        const data = await getUserLoans(uid);

        if (data?.loans) {
          const filteredLoans = data.loans.filter(
            (loan) => loan.loanStatus !== "Approved"
          );

          const mappedLoans: Application[] = filteredLoans.map(
            (loan, index) => ({
              loanRequestID: loan.loanRequestID,
              uid: loan.uid,
              maritalStatus: loan.maritalStatus,
              highestEducation: loan.highestEducation,
              employmentInformation: loan.employmentInformation,
              residentType: loan.residentType,
              detailedAddress: loan.detailedAddress,
              loanType: loan.loanType,
              loanPurpose: loan.loanPurpose || "Unknown",
              loanAmount: loan.loanAmount,
              loanStatus:
                loan.loanStatus === "Approved"
                  ? "Approved"
                  : loan.loanStatus === "Denied"
                  ? "Denied"
                  : loan.loanStatus === "Completed"
                  ? "Completed"
                  : loan.loanStatus === "InProgress"
                  ? "InProgress"
                  : "Pending",
              createdAt: new Date(loan.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            })
          );

          setApplications(mappedLoans);
        }
      } catch (err) {
        console.error("Failed to fetch user loans", err);
      }
    };

    fetchLoans();
  }, []);

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const paginatedApps = applications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-4 poppins-normal">
      {loading && <p>Loading loans...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && applications.length === 0 && (
        <p>No loan applications found.</p>
      )}

      {paginatedApps.map((app) => (
        <div
          key={app.loanRequestID}
          onClick={() => onSelect(app)}
          className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-1 cursor-pointer hover:shadow-lg transition hover:border-1 ease-in-out duration-300 "
        >
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">{app.loanPurpose}</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColor[app.loanStatus]
              }`}
              style={app.loanStatus === 'Approved' ? statusStyle.Approved : {}}
            >
              {app.loanStatus}
            </span>
          </div>
          <p className="text-gray-600 text-sm">Amount: {app.loanAmount}</p>
          <p className="text-gray-500 text-xs">Applied: {app.createdAt}</p>
        </div>
      ))}

      {/* Pagination controls */}
      {applications.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center space-x-4 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
