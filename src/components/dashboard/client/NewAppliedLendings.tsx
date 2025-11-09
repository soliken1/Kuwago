"use client";
import React, { useEffect, useState } from "react";
import { useFetchUserLoans } from "@/hooks/lend/requestUserLoan";
import { Application } from "@/types/lendings";
import { IoEyeOutline } from "react-icons/io5";
import LoanDetailsModal from "./LoanDetailsModal";
import { LoanInfo } from "@/types/lendings";
const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-300",
  Approved: "bg-green-100 text-green-700 border border-green-300",
  Denied: "bg-red-100 text-red-700 border border-red-300",
  Completed: "bg-gray-100 text-gray-700 border border-gray-300",
};

interface Props {
  onSelect?: (app: Application) => void;
  setUserLoans?: React.Dispatch<React.SetStateAction<Application[] | null>>;
}

const ITEMS_PER_PAGE = 5;

export default function NewAppliedLendings({ setUserLoans, onSelect }: Props) {
  const { getUserLoans, loading, error } = useFetchUserLoans();
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

          const mappedLoans: Application[] = filteredLoans.map((loan) => {
            const loanTypeStr: string = 
              loan.loanType !== undefined && loan.loanType !== null
                ? (typeof loan.loanType === "number" ? loan.loanType.toString() : String(loan.loanType))
                : "Not provided";
            
            const loanAmountStr: string = 
              loan.loanAmount !== undefined && loan.loanAmount !== null
                ? (typeof loan.loanAmount === "number" ? loan.loanAmount.toString() : String(loan.loanAmount))
                : "0";

            return {
              loanRequestID: loan.loanRequestID,
              uid: loan.uid,
              maritalStatus: loan.maritalStatus ?? "Not provided",
              highestEducation: loan.highestEducation ?? "Not provided",
              employmentInformation: loan.employmentInformation ?? "Not provided",
              residentType: loan.residentType ?? "Not provided",
              detailedAddress: loan.detailedAddress ?? "Address not provided",
              loanType: loanTypeStr,
              loanPurpose: loan.loanPurpose ?? "Unknown",
              loanAmount: loanAmountStr,
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
              createdAt: loan.createdAt
                ? new Date(loan.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date().toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
              lenderInfo: loan.lenderInfo,
              businessName: data.userInfo?.businessName,
              businessAddress: data.userInfo?.businessAddress,
              businessTIN: loan.businessTIN,
              businessType: loan.businessType,
            };
          });

          const hasActiveLoans = mappedLoans.some((loan) =>
            ["Approved", "InProgress", "Pending"].includes(loan.loanStatus)
          );

          localStorage.setItem("active_loans", JSON.stringify(hasActiveLoans));

          setUserLoans?.(mappedLoans);
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

  const handleAppSelect = (app: Application) => {
    setSelectedApp(app);
    setIsModalOpen(true);
    if (onSelect) {
      onSelect(app);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">All Loans</h3>
            <p className="text-gray-600 text-sm">
              Check all your loan applications
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loan Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Applied
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading loans...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                  Error: {error}
                </td>
              </tr>
            )}
            {!loading && applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No loan applications found.
                </td>
              </tr>
            )}
            {paginatedApps.map((app) => (
              <tr key={app.loanRequestID} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#2c8068] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">
                        {app.loanPurpose.charAt(0)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {app.loanPurpose}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₱{app.loanAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {app.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColor[app.loanStatus]
                    }`}
                  >
                    {app.loanStatus === "InProgress"
                      ? "In Progress"
                      : app.loanStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                  <button
                    onClick={() => handleAppSelect(app)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <IoEyeOutline size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {applications.length > ITEMS_PER_PAGE && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, applications.length)} of{" "}
              {applications.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan Details Modal */}
      <LoanDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        application={selectedApp}
      />
    </div>
  );
}
