"use client";
import React, { useState, useEffect } from "react";
import { useFetchAllLoans } from "@/hooks/lend/fetchAllLoans";
import toast from "react-hot-toast";
import { chatClient } from "@/utils/streamClient";
import { useUpdateLoanStatus } from "@/hooks/lend/requestUpdateLoan";
import useCheckDueSoon from "@/hooks/admin/useCheckDueSoon";
import requestNotificationDueSoon from "@/hooks/admin/useMarkNotified";
import SelectedLoan from "./SelectedLoan";
import { IoEyeOutline } from "react-icons/io5";
import { LoanWithUserInfo } from "@/types/lendings";
import notifyAcknowledgeLoan from "@/utils/notifyAcknowledgeLoan";
import { getBusinessTypeLabel, getLoanTypeLabel } from "@/types/loanTypes";
import { notifyDueSoon } from "@/utils/notifyDueSoon";
import useGetLenderDetails from "@/hooks/users/useLenderDetails";
import { StoredUser } from "@/types/templateTypes";
import {
  useSubscriptionCheckout,
  useGetAvailablePlans,
  useCheckSubscriptionActive,
} from "@/hooks/payment/useSubscription";

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
  const { markNotified } = requestNotificationDueSoon();
  const { fetchDueSoon } = useCheckDueSoon();
  const {
    lenderUsers,
    lendersData,
    loading: lenderLoading,
  } = useGetLenderDetails();

  // Subscription hooks
  const { createCheckout, loading: checkoutLoading } =
    useSubscriptionCheckout();
  const { plans } = useGetAvailablePlans();
  const { isActive, checkActive } = useCheckSubscriptionActive();

  const [showModal, setShowModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithUserInfo | null>(
    null
  );
  const [selectedPlan, setSelectedPlan] = useState("Monthly");
  const [loans, setLoans] = useState<LoanWithUserInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchAllLoans, loading } = useFetchAllLoans();
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [lenderDetails, setLenderDetails] = useState<{
    subscriptionType?: number;
    createdAt?: string;
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
    const fetchLenderDetails = async () => {
      await lenderUsers();
    };
    fetchLenderDetails();
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setStoredUser(parsedUser);

      // Check subscription status
      if (parsedUser.uid) {
        checkActive(parsedUser.uid);
      }
    }
  }, []);

  useEffect(() => {
    if (lendersData?.data) {
      setLenderDetails(lendersData.data);
      localStorage.setItem("lenderDetails", JSON.stringify(lendersData.data));
    }
  }, [lendersData]);

  useEffect(() => {
    const getDueSoon = async () => {
      try {
        const data = await fetchDueSoon();

        for (const payable of data) {
          if (!payable.notified) {
            try {
              await notifyDueSoon(
                payable,
                "https://kuwago.vercel.app/dashboard"
              );

              const dueDate = payable.nextPaymentDueDate
                ? payable.nextPaymentDueDate.split("T")[0]
                : "";

              await markNotified(payable.payableID, dueDate);
            } catch (err) {
              console.error(
                `❌ Failed to notify ${payable.borrowerInfo.email}:`,
                err
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch due soon payables:", err);
      }
    };

    getDueSoon();
  }, [loans]);

  const openModal = (loan: LoanWithUserInfo) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setShowModal(false);
  };

  const sendMessage = async () => {
    if (!selectedLoan || !storedUser) return; // Add null check

    const borrowerName =
      selectedLoan.loanInfo.firstName ||
      "" + selectedLoan.loanInfo.lastName ||
      "";

    await sendLoanApplicationMessage({
      borrowerId: selectedLoan.loanInfo.uid,
      borrowerName: borrowerName,
      email: selectedLoan.userInfo.email,
      lenderId: storedUser.uid || "", // Add fallback
      lenderName: storedUser.username || "", // Add fallback
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

  // In handleUpgrade function:
  const handleUpgrade = async () => {
    if (!storedUser?.uid) {
      // Use optional chaining
      return;
    }

    if (!storedUser.fullName) {
      return;
    }

    try {
      await createCheckout(storedUser.uid, storedUser.fullName, selectedPlan);
    } catch (error) {
      toast.error("Failed to create checkout. Please try again.");
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

  const hasFreeTrialExpired = () => {
    if (!lenderDetails.createdAt) return false;
    const createdDate = new Date(lenderDetails.createdAt);
    const now = new Date();
    const diffDays =
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return lenderDetails.subscriptionType === 0 && diffDays > 7;
  };

  const getPlanSavings = (planType: string) => {
    if (planType === "Quarterly") return "₱300";
    if (planType === "Yearly") return "₱1200";
    return null;
  };

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
                      onClick={() => {
                        if (hasFreeTrialExpired()) {
                          setShowTrialModal(true);
                        } else {
                          openModal(loan);
                        }
                      }}
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

      {/* Subscription Trial Modal */}
      {showTrialModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 max-w-lg w-full relative animate-fadeIn">
            {/* Close button */}
            <button
              onClick={() => setShowTrialModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-[#e8f5f1] p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="#2c8068"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
              Trial Period Ended
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed text-center">
              Your 7-day free trial has ended. To continue accessing borrower
              loan details and unlock full lender features, please choose a
              plan.
            </p>

            {/* Plan Selection */}
            <div className="space-y-3 mb-6">
              {plans.map((plan) => (
                <button
                  key={plan.planType}
                  onClick={() => setSelectedPlan(plan.planType)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlan === plan.planType
                      ? "border-[#2c8068] bg-[#e8f5f1]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {plan.planType}
                      </div>
                      <div className="text-sm text-gray-600">
                        {plan.durationMonths}{" "}
                        {plan.durationMonths === 1 ? "month" : "months"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#2c8068]">
                        ₱{plan.amount.toLocaleString()}
                      </div>
                      {getPlanSavings(plan.planType) && (
                        <div className="text-xs text-green-600">
                          Save {getPlanSavings(plan.planType)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowTrialModal(false)}
                disabled={checkoutLoading}
                className="px-5 py-2.5 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Later
              </button>
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="px-5 py-2.5 rounded-lg text-white bg-[#2c8068] hover:bg-[#246955] transition disabled:opacity-50 flex items-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade Now - ₱
                    {plans
                      .find((p) => p.planType === selectedPlan)
                      ?.amount.toLocaleString()}
                  </>
                )}
              </button>
            </div>

            {/* Payment methods note */}
            <p className="text-xs text-center text-gray-500 mt-4">
              Secure payment via GCash, PayMaya, GrabPay, or Card
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedLoan && storedUser && (
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
