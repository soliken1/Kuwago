"use client";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import X from "../../../../assets/actions/X";
import { LoanWithUserInfo } from "@/types/lendings";
import {
  useFetchPaymentSummary,
  PaymentSummary,
} from "@/hooks/lend/fetchPaymentSummary";
import {
  useFetchPaymentSchedule,
  PaymentSchedule,
} from "@/hooks/lend/fetchPaymentSchedule";
import { useRequestPayment, PaymentRequest } from "@/hooks/lend/requestPayment";
import {
  useFetchAIAssessment,
  AIAssessmentData,
} from "@/hooks/lend/fetchAIAssessment";
import { getBusinessTypeLabel, getLoanTypeLabel } from "@/types/loanTypes";
import createDocument from "@/utils/document/create";
import CustomAlertModal from "@/components/profile/client/CustomAlertModal";
import { StoredUser } from "@/types/templateTypes";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-300",
  Approved: "bg-green-100 text-green-700 border border-green-300",
  Denied: "bg-red-100 text-red-700 border border-red-300",
  Completed: "bg-gray-100 text-gray-700 border border-gray-300",
};

interface LenderDetails {
  uid: string;
  principalAmount: number;
  termsOfPayment: number[];
  interestRates: number[];
  subscriptionType: number;
  gracePeriod: number;
  lenderTIN: string;
  lenderInstitution: string;
  lenderAddress: string;
  createdAt: string;
}

interface Props {
  selectedLoan: LoanWithUserInfo;
  closeModal: () => void;
  sendMessage: () => void;
  updateLoanStatus: (
    loanRequestID: string,
    loanStatus: string,
    loanAmount: number,
    interestRate: number,
    termsofMonths: number,
    paymentType: number
  ) => void;
  storedUser: StoredUser;
}

export default function SelectedLoan({
  selectedLoan,
  closeModal,
  sendMessage,
  updateLoanStatus,
  storedUser,
}: Props) {
  const [finalAmount, setFinalAmount] = useState<number>(
    selectedLoan.loanInfo.loanAmount
  );
  const [interestRate, setInterestRate] = useState<number>(0);
  const [termsOfMonths, setTermsOfMonths] = useState<number>(3);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] =
    useState<boolean>(false);
  const [showApproveConfirmModal, setShowApproveConfirmModal] =
    useState<boolean>(false);
  const [showDenyConfirmModal, setShowDenyConfirmModal] =
    useState<boolean>(false);

  // Lender details from localStorage
  const [lenderDetails, setLenderDetails] = useState<LenderDetails | null>(
    null
  );

  // Payment data states
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(
    null
  );
  const [paymentSchedule, setPaymentSchedule] =
    useState<PaymentSchedule | null>(null);
  const { fetchPaymentSummary, loading: summaryLoading } =
    useFetchPaymentSummary();
  const { fetchPaymentSchedule, loading: scheduleLoading } =
    useFetchPaymentSchedule();
  const { submitPayment, loading: paymentLoading } = useRequestPayment();
  const hasFetchedPaymentData = useRef(false);

  // AI Assessment states
  const [aiAssessment, setAiAssessment] = useState<AIAssessmentData | null>(
    null
  );
  const { fetchAIAssessment, loading: aiAssessmentLoading } =
    useFetchAIAssessment();
  const hasFetchedAIAssessment = useRef(false);

  // Load lender details from localStorage
  useEffect(() => {
    try {
      const storedLenderDetails = localStorage.getItem("lenderDetails");
      if (storedLenderDetails) {
        const parsedDetails: LenderDetails = JSON.parse(storedLenderDetails);
        setLenderDetails(parsedDetails);

        // Set default values if available
        if (parsedDetails.interestRates.length > 0) {
          setInterestRate(parsedDetails.interestRates[0]);
        }
        if (parsedDetails.termsOfPayment.length > 0) {
          setTermsOfMonths(parsedDetails.termsOfPayment[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load lender details from localStorage:", error);
    }
  }, []);

  // Fetch payment data when loan is Approved or Completed
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (
        (selectedLoan.loanInfo.loanStatus === "Approved" ||
          selectedLoan.loanInfo.loanStatus === "Completed") &&
        !hasFetchedPaymentData.current
      ) {
        const payableID =
          selectedLoan.loanInfo.payableID ||
          selectedLoan.payableID ||
          selectedLoan.payable_id ||
          selectedLoan.payableId;

        if (payableID) {
          hasFetchedPaymentData.current = true;
          try {
            const summary = await fetchPaymentSummary(payableID);
            setPaymentSummary(summary);

            const schedule = await fetchPaymentSchedule(
              selectedLoan.userInfo.uid,
              payableID
            );
            setPaymentSchedule(schedule);
          } catch (error) {
            toast.error("Failed to load payment information");
            hasFetchedPaymentData.current = false;
          }
        }
      }
    };

    fetchPaymentData();
  }, [
    selectedLoan.loanInfo.loanStatus,
    selectedLoan.loanInfo.payableID,
    selectedLoan.userInfo.uid,
  ]);

  // Fetch AI Assessment when loan is InProgress
  useEffect(() => {
    const fetchAIAssessmentData = async () => {
      if (
        selectedLoan.loanInfo.loanStatus === "InProgress" &&
        !hasFetchedAIAssessment.current
      ) {
        hasFetchedAIAssessment.current = true;
        try {
          const assessment = await fetchAIAssessment(selectedLoan.userInfo.uid);
          setAiAssessment(assessment);
        } catch (error) {
          toast.error("Failed to load AI assessment");
          hasFetchedAIAssessment.current = false;
        }
      }
    };

    fetchAIAssessmentData();
  }, [selectedLoan.loanInfo.loanStatus, selectedLoan.userInfo.uid]);

  const handleApproveConfirm = async () => {
    setShowApproveConfirmModal(false);
    try {
      updateLoanStatus(
        selectedLoan.loanInfo.loanRequestID,
        "Approved",
        finalAmount,
        interestRate,
        termsOfMonths,
        1
      );

      await createDocument(selectedLoan, storedUser);

      toast.success("Loan approved and document sent to recipients.");
      window.location.reload();
    } catch (error) {
      console.error("PandaDoc error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(
          `Loan approved but failed to send document: ${errorMessage}`
        );
      } else {
        toast.error("Loan approved but failed to send document.");
      }
    }
  };

  const handleApprove = () => {
    setShowApproveConfirmModal(true);
  };

  const handleDenyConfirm = () => {
    setShowDenyConfirmModal(false);
    updateLoanStatus(
      selectedLoan.loanInfo.loanRequestID,
      "Denied",
      selectedLoan.loanInfo.loanAmount,
      0,
      0,
      0
    );
    window.location.reload();
    toast.error("Loan denied");
  };

  const handleDeny = () => {
    setShowDenyConfirmModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (!selectedLoan.loanInfo.payableID) {
      toast.error("No payable ID found for this loan");
      return;
    }

    try {
      const paymentData: PaymentRequest = {
        payableID: selectedLoan.loanInfo.payableID,
        borrowerUID: selectedLoan.userInfo.uid,
        amountPaid: paymentAmount,
        paymentDate: new Date().toISOString(),
        notes: paymentNotes.trim() || "Payment recorded by lender",
        paymentType: "ECash",
      };

      await submitPayment(paymentData);

      toast.success(
        `Payment of ₱${paymentAmount.toLocaleString()} recorded successfully`
      );
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentNotes("");

      hasFetchedPaymentData.current = false;
      setPaymentSummary(null);
      setPaymentSchedule(null);

      const payableID = selectedLoan.loanInfo.payableID;
      if (payableID) {
        try {
          const summary = await fetchPaymentSummary(payableID);
          setPaymentSummary(summary);

          const schedule = await fetchPaymentSchedule(
            selectedLoan.userInfo.uid,
            payableID
          );
          setPaymentSchedule(schedule);
        } catch (error) {
          // Failed to refresh payment data
        }
      }
    } catch (error) {
      toast.error("Failed to record payment. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Loan Application Details
          </h2>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Section 1: Overview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-[#2c8068]" />
              <span className="font-semibold text-sm text-gray-700">
                Overview
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Applicant</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {selectedLoan.userInfo.firstName}{" "}
                  {selectedLoan.userInfo.lastName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Email</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {selectedLoan.userInfo.email}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Loan Amount</span>
                <span className="mt-1 text-gray-800 font-medium">
                  ₱{selectedLoan.loanInfo.loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Loan Type</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {getLoanTypeLabel(selectedLoan.loanInfo.loanType)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Purpose</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {selectedLoan.loanInfo.loanPurpose}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Status</span>
                <span
                  className={`mt-1 inline-block w-fit px-3 py-1 text-sm rounded-full font-medium ${
                    statusColor[
                      selectedLoan.loanInfo
                        .loanStatus as keyof typeof statusColor
                    ] || statusColor.Pending
                  }`}
                >
                  {selectedLoan.loanInfo.loanStatus === "InProgress"
                    ? "In Progress"
                    : selectedLoan.loanInfo.loanStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Business Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-blue-400" />
              <span className="font-semibold text-sm text-gray-700">
                Business Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Business TIN</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {selectedLoan.loanInfo.businessTIN || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Business Type</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {getBusinessTypeLabel(selectedLoan.loanInfo.businessType)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Loan Terms (if InProgress) */}
          {selectedLoan.loanInfo.loanStatus === "InProgress" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-2 h-5 rounded bg-purple-400" />
                <span className="font-semibold text-sm text-gray-700">
                  Loan Terms
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    Final Loan Amount (₱)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c8068]"
                    value={finalAmount === 0 ? "" : finalAmount}
                    placeholder="0"
                    onChange={(e) =>
                      setFinalAmount(Number(e.target.value) || 0)
                    }
                    min={0}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    Interest Rate (%)
                  </label>
                  <select
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c8068] bg-white"
                  >
                    <option value={0}>Select Interest Rate</option>
                    {lenderDetails?.interestRates.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    Terms of Months
                  </label>
                  <select
                    value={termsOfMonths}
                    onChange={(e) => setTermsOfMonths(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c8068] bg-white"
                  >
                    {lenderDetails?.termsOfPayment.map((term) => (
                      <option key={term} value={term}>
                        {term} {term === 1 ? "Month" : "Months"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 3.5: AI Assessment (if InProgress) */}
          {selectedLoan.loanInfo.loanStatus === "InProgress" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(44, 128, 104, 0.1)" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "#2c8068" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 poppins-semibold">
                  AI Assessment
                </h3>
              </div>

              <div
                className="border-2 rounded-2xl p-6"
                style={{ borderColor: "#2c8068" }}
              >
                {aiAssessmentLoading ? (
                  <div className="text-center text-gray-500 py-8 poppins-normal">
                    Loading AI assessment...
                  </div>
                ) : aiAssessment ? (
                  <div className="space-y-6">
                    {/* Risk Level and Recommendation */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="rounded-xl p-4"
                        style={{ backgroundColor: "rgba(44, 128, 104, 0.05)" }}
                      >
                        <p
                          className="text-xs mb-2 poppins-medium"
                          style={{ color: "#2c8068" }}
                        >
                          Risk Level
                        </p>
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold poppins-bold ${
                            aiAssessment.riskLevel === "Low"
                              ? "bg-green-100 text-green-700"
                              : aiAssessment.riskLevel === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <span>{aiAssessment.riskLevel}</span>
                        </div>
                      </div>
                      <div
                        className="rounded-xl p-4"
                        style={{ backgroundColor: "rgba(44, 128, 104, 0.05)" }}
                      >
                        <p
                          className="text-xs mb-2 poppins-medium"
                          style={{ color: "#2c8068" }}
                        >
                          Recommendation
                        </p>
                        <p className="text-sm font-bold text-gray-900 poppins-bold">
                          {aiAssessment.recommendation}
                        </p>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div
                      className="rounded-xl p-4 border-l-4"
                      style={{
                        backgroundColor: "rgba(44, 128, 104, 0.05)",
                        borderLeftColor: "#2c8068",
                      }}
                    >
                      <p className="text-sm text-gray-700 poppins-normal">
                        <span
                          className="font-semibold poppins-semibold"
                          style={{ color: "#2c8068" }}
                        >
                          Assessment Reasoning:
                        </span>
                        <br />
                        <ul className="list-disc list-inside space-y-2 mt-2">
                          {aiAssessment.reasoning.map((reason, index) => (
                            <li key={index} className="text-sm text-gray-700">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8 poppins-normal">
                    No AI assessment available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Payment Tracking (if Approved/Completed) */}
          {(selectedLoan.loanInfo.loanStatus === "Approved" ||
            selectedLoan.loanInfo.loanStatus === "Completed") && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-2 h-5 rounded bg-green-400" />
                <span className="font-semibold text-sm text-gray-700">
                  Payment Tracking
                </span>
              </div>

              {/* Loan Information Section */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Loan Amount</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {summaryLoading
                        ? "Loading..."
                        : paymentSummary
                        ? `₱${paymentSummary.totalPayableAmount.toLocaleString()}`
                        : `₱${selectedLoan.loanInfo.loanAmount.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Total Paid</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {summaryLoading
                        ? "Loading..."
                        : paymentSummary
                        ? `₱${paymentSummary.totalPaid.toLocaleString()}`
                        : "₱0.00"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      Remaining Balance
                    </span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {summaryLoading
                        ? "Loading..."
                        : paymentSummary
                        ? `₱${paymentSummary.remainingBalance.toLocaleString()}`
                        : `₱${selectedLoan.loanInfo.loanAmount.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      Monthly Payment
                    </span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {scheduleLoading
                        ? "Loading..."
                        : paymentSchedule
                        ? `₱${paymentSchedule.monthlyPayment.toLocaleString()}`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Paid Payments Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    Paid Payments
                  </h3>
                  <button
                    onClick={() => setShowPaymentHistoryModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    View Payment History
                  </button>
                </div>
                <div className="grid gap-3">
                  {scheduleLoading ? (
                    <div className="text-center text-gray-500 py-4">
                      Loading payments...
                    </div>
                  ) : paymentSchedule && paymentSchedule.schedule ? (
                    (() => {
                      const paidPayments = paymentSchedule.schedule.filter(
                        (item) =>
                          item.status === "Paid" || item.status === "Advance"
                      );

                      return paidPayments.length > 0 ? (
                        paidPayments.map((payment, index) => (
                          <div
                            key={`paid-${index}`}
                            className="bg-green-50 border border-green-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-green-600 font-medium">
                                  Due Date
                                </p>
                                <p className="text-gray-800 font-semibold">
                                  {new Date(payment.dueDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                                {payment.paymentDate && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Paid on:{" "}
                                    {new Date(
                                      payment.paymentDate
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-green-600 font-medium">
                                  Amount Due
                                </p>
                                <p className="text-green-700 font-bold text-lg">
                                  ₱{payment.actualPayment.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No payments made yet
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No payment schedule available
                    </div>
                  )}
                </div>
              </div>

              {/* Unpaid Payments Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    Unpaid Payments
                  </h3>
                </div>
                <div className="grid gap-3">
                  {scheduleLoading ? (
                    <div className="text-center text-gray-500 py-4">
                      Loading schedule...
                    </div>
                  ) : paymentSchedule && paymentSchedule.schedule ? (
                    (() => {
                      const unpaidPayments = paymentSchedule.schedule.filter(
                        (item) =>
                          item.status === "Unpaid" ||
                          item.status === "Advance Applied"
                      );

                      return unpaidPayments.length > 0 ? (
                        unpaidPayments.map((payment, index) => (
                          <div
                            key={`unpaid-${index}`}
                            className="bg-red-50 border border-red-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-red-600 font-medium">
                                  Due Date
                                </p>
                                <p className="text-gray-800 font-semibold">
                                  {new Date(payment.dueDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                                {payment.status === "Advance Applied" && (
                                  <p className="text-xs text-orange-600 mt-1 font-medium">
                                    Advance Applied
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-red-600 font-medium">
                                  {payment.status === "Advance Applied"
                                    ? "Amount Applied"
                                    : "Amount Due"}
                                </p>
                                <p className="text-red-700 font-bold text-lg">
                                  ₱
                                  {payment.status === "Advance Applied"
                                    ? payment.actualPayment.toLocaleString()
                                    : payment.requiredToPayEveryMonth.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          All payments completed!
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No payment schedule available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={closeModal}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          {selectedLoan.loanInfo.loanStatus === "InProgress" && (
            <>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors"
              >
                Approve
              </button>
              <button
                onClick={handleDeny}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Deny
              </button>
            </>
          )}

          {(selectedLoan.loanInfo.loanStatus === "Pending" ||
            selectedLoan.loanInfo.loanStatus === "Denied") && (
            <button
              onClick={sendMessage}
              className="px-6 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors"
            >
              Send a Message
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Record Payment
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (₱)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount === 0 ? "" : paymentAmount}
                    placeholder="Enter payment amount"
                    className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c8068]"
                    onChange={(e) =>
                      setPaymentAmount(Number(e.target.value) || 0)
                    }
                    min={0}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    placeholder="Enter payment notes (optional)"
                    className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c8068]"
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={paymentLoading}
                  className="px-6 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Payment History Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Payment History
              </h2>
              <button
                onClick={() => setShowPaymentHistoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>

            {/* Payment History Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Payment Records
                </h3>

                <div className="grid gap-4">
                  {summaryLoading ? (
                    <div className="text-center text-gray-500 py-4">
                      Loading payment history...
                    </div>
                  ) : paymentSummary && paymentSummary.payments.length > 0 ? (
                    paymentSummary.payments.map((payment) => (
                      <div
                        key={payment.paymentID}
                        className="bg-green-50 border border-green-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-green-600 font-medium">
                              Payment Date
                            </p>
                            <p className="text-gray-800 font-semibold">
                              {new Date(payment.paymentDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-gray-600 mt-2">
                                <span className="font-medium">Notes:</span>{" "}
                                {payment.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600 font-medium">
                              Amount Paid
                            </p>
                            <p className="text-green-700 font-bold text-lg">
                              ₱{payment.amountPaid.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No payment history available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment History Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPaymentHistoryModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Loan Confirmation Modal */}
      <CustomAlertModal
        isOpen={showApproveConfirmModal}
        onClose={() => setShowApproveConfirmModal(false)}
        title="Approve Loan"
        message={`Are you sure you want to approve this loan with ₱${finalAmount.toLocaleString()}, an Interest of ${interestRate}%, and a Terms of ${termsOfMonths} Months?`}
        type="info"
        showCancel={true}
        onConfirm={handleApproveConfirm}
        confirmText="Approve"
        cancelText="Cancel"
      />

      {/* Deny Loan Confirmation Modal */}
      <CustomAlertModal
        isOpen={showDenyConfirmModal}
        onClose={() => setShowDenyConfirmModal(false)}
        title="Deny Loan"
        message="Are you sure you want to deny this loan?"
        type="warning"
        showCancel={true}
        onConfirm={handleDenyConfirm}
        confirmText="Deny"
        cancelText="Cancel"
      />
    </div>
  );
}
