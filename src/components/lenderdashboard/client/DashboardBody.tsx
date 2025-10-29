"use client";
import React, { useState, useEffect } from "react";
import { useFetchAllLoans } from "@/hooks/lend/fetchAllLoans";
import toast from "react-hot-toast";
import { chatClient } from "@/utils/streamClient";
import { useUpdateLoanStatus } from "@/hooks/lend/requestUpdateLoan";
import SelectedLoan from "./SelectedLoan";
import { IoEyeOutline } from "react-icons/io5";
import { LoanWithUserInfo } from "@/types/lendings";
import notifyAcknowledgeLoan from "@/utils/notifyAcknowledgeLoan";
import { getBusinessTypeLabel, getLoanTypeLabel } from "@/types/loanTypes";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-300",
  Approved: "bg-green-100 text-green-700 border border-green-300",
  Denied: "bg-red-100 text-red-700 border border-red-300",
  Completed: "bg-gray-100 text-gray-700 border border-gray-300",
};

const ITEMS_PER_PAGE = 10;

export default function DashboardBody() {
  const { updateLoanStatus } = useUpdateLoanStatus();
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithUserInfo | null>(
    null
  );
  const [loans, setLoans] = useState<LoanWithUserInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchAllLoans, loading } = useFetchAllLoans();
  const [storedUser, setStoredUser] = useState<{
    uid?: string;
    username?: string;
    email?: string;
  }>({});

  useEffect(() => {
    const getLoans = async () => {
      try {
        const data = await fetchAllLoans();
        setLoans(data);
      } catch (err) {
        toast.error("Failed to fetch loan requests.");
      }
    };
    getLoans();
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setStoredUser(JSON.parse(user));
  }, []);

  const openModal = (loan: LoanWithUserInfo) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setShowModal(false);
  };

  const sendMessage = async () => {
    if (!selectedLoan) return;

    const borrowerName =
      selectedLoan.loanInfo.firstName ||
      "" + selectedLoan.loanInfo.lastName ||
      "";

    await sendLoanApplicationMessage({
      borrowerId: selectedLoan.loanInfo.uid,
      borrowerName: borrowerName,
      email: selectedLoan.userInfo.email,
      lenderId: storedUser.uid,
      lenderName: storedUser.username,
      loanPurpose: selectedLoan.loanInfo.loanPurpose,
      loanAmount: selectedLoan.loanInfo.loanAmount,
      loanDate: new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    await updateLoanStatus(
      selectedLoan.loanInfo.loanRequestID,
      "InProgress",
      selectedLoan.loanInfo.loanAmount,
      0,
      0,
      0
    );
    window.location.reload();
    closeModal();
  };

  const sendLoanApplicationMessage = async ({
    borrowerId,
    borrowerName,
    email,
    lenderId,
    lenderName,
    loanPurpose,
    loanAmount,
    loanDate,
  }: {
    borrowerId: string;
    borrowerName: string | any;
    email: string | any;
    lenderId: string | any;
    lenderName: string | any;
    loanPurpose: string;
    loanAmount: number;
    loanDate: string;
  }) => {
    try {
      const channel = chatClient.channel("messaging", {
        members: [borrowerId, lenderId],
      });

      await channel.watch();

      const messageText = `
      Your loan was acknowledged please start here!

      Lender: ${lenderName}  
      Purpose: ${loanPurpose}  
      Amount: ₱${loanAmount.toLocaleString()}  
      Date: ${loanDate}
          `.trim();

      await channel.sendMessage({ text: messageText });

      await notifyAcknowledgeLoan(
        email,
        borrowerName,
        "https://kuwago.vercel.app/dashboard",
        "Loan Acknowledgement"
      );
    } catch (error) {
      console.error("Failed to send loan application message:", error);
    }
  };

  const filteredLoans = loans.filter(({ userInfo }) => {
    const term = searchTerm.toLowerCase();
    return (
      userInfo.firstName.toLowerCase().includes(term) ||
      userInfo.lastName.toLowerCase().includes(term) ||
      userInfo.email.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Loan Applications
            </h3>
            <p className="text-gray-600 text-sm">
              Review and manage loan requests
            </p>
          </div>
          <div className="w-80">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8068]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business TIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Loading loan requests...
                </td>
              </tr>
            )}
            {!loading && filteredLoans.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No loan applications found.
                </td>
              </tr>
            )}
            {paginatedLoans.map((loan) => {
              const { loanInfo, userInfo } = loan;
              return (
                <tr key={loanInfo.loanRequestID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#2c8068] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">
                          {userInfo.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {userInfo.firstName} {userInfo.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{loanInfo.loanAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getLoanTypeLabel(loanInfo.loanType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loanInfo.loanPurpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loanInfo.businessTIN || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getBusinessTypeLabel(loanInfo.businessType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColor[
                          loanInfo.loanStatus as keyof typeof statusColor
                        ] || statusColor.Pending
                      }`}
                    >
                      {loanInfo.loanStatus === "InProgress"
                        ? "In Progress"
                        : loanInfo.loanStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={() => openModal(loan)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <IoEyeOutline size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredLoans.length > ITEMS_PER_PAGE && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredLoans.length)} of{" "}
              {filteredLoans.length} results
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

      {/* Modal */}
      {showModal && selectedLoan && (
        <SelectedLoan
          selectedLoan={selectedLoan}
          sendMessage={sendMessage}
          closeModal={closeModal}
          updateLoanStatus={updateLoanStatus}
          storedUser={storedUser}
        />
      )}
    </div>
  );
}
