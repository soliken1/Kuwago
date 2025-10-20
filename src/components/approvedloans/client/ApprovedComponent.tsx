"use client";
import React, { useEffect, useState, useRef } from "react";
import { useFetchApprovedLoans } from "@/hooks/lend/fetchApprovedLoans";
import { IoEyeOutline } from "react-icons/io5";
import X from "../../../../assets/actions/X";
import { useFetchPaymentSummary, PaymentSummary } from "@/hooks/lend/fetchPaymentSummary";
import { useFetchPaymentSchedule, PaymentSchedule } from "@/hooks/lend/fetchPaymentSchedule";
import { useRequestPayment, PaymentRequest } from "@/hooks/lend/requestPayment";
import toast from "react-hot-toast";

interface ApprovedLoan {
  loanPurpose: string;
  type: string;
  amount: number;
  interestRate: number;
  interestAmount: number;
  lender: string;
  borrower: string;
  agreementDate: string;
  status: string;
  payableID: string;
  paymentType: string;
}

const statusColor: { [key: string]: string } = {
  Approved: "bg-green-100 text-green-700 border border-green-300",
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-300",
  Denied: "bg-red-100 text-red-700 border border-red-300",
  Completed: "bg-gray-100 text-gray-700 border border-gray-300",
};

export default function ApprovedComponent() {
  const { submitLoanRequest, loading, error } = useFetchApprovedLoans();
  const [approvedLoans, setApprovedLoans] = useState<ApprovedLoan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<ApprovedLoan | null>(null);
  
  // Payment data states
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState<boolean>(false);
  
  const { fetchPaymentSummary, loading: summaryLoading } = useFetchPaymentSummary();
  const { fetchPaymentSchedule, loading: scheduleLoading } = useFetchPaymentSchedule();
  const { submitPayment, loading: paymentLoading } = useRequestPayment();
  const hasFetchedPaymentData = useRef(false);

  const handleViewLoan = (loan: ApprovedLoan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setShowModal(false);
    // Reset payment data when closing modal
    setPaymentSummary(null);
    setPaymentSchedule(null);
    hasFetchedPaymentData.current = false;
  };

  // Fetch payment data when loan is selected and has payableID
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (selectedLoan && selectedLoan.payableID && !hasFetchedPaymentData.current) {
        hasFetchedPaymentData.current = true;
        try {
          // Fetch payment summary
          const summary = await fetchPaymentSummary(selectedLoan.payableID);
          setPaymentSummary(summary);

          // Fetch payment schedule - we need borrower UID for this
          // For now, we'll use a placeholder or get it from localStorage
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const { uid } = JSON.parse(storedUser);
            const schedule = await fetchPaymentSchedule(uid, selectedLoan.payableID);
            setPaymentSchedule(schedule);
          }
        } catch (error) {
          toast.error("Failed to load payment information");
          hasFetchedPaymentData.current = false; // Reset on error to allow retry
        }
      }
    };

    fetchPaymentData();
  }, [selectedLoan, fetchPaymentSummary, fetchPaymentSchedule]);

  const handlePaymentSubmit = async () => {
    if (paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (!selectedLoan?.payableID) {
      toast.error("No payable ID found for this loan");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("User not found");
        return;
      }
      
      const { uid } = JSON.parse(storedUser);
      const paymentData: PaymentRequest = {
        payableID: selectedLoan.payableID,
        borrowerUID: uid,
        amountPaid: paymentAmount,
        paymentDate: new Date().toISOString(),
        notes: paymentNotes.trim() || "Payment recorded through ECash",
        paymentType: String(selectedLoan.paymentType || "Cash")
      };

      const response = await submitPayment(paymentData);
      
      // Check if this is an ECash payment and has a checkout URL
      if (selectedLoan.paymentType === "ECash" && response.data?.checkoutUrl) {
        toast.success(`Payment of ₱${paymentAmount.toLocaleString()} initiated. Redirecting to payment gateway...`);
        setShowPaymentModal(false);
        setPaymentAmount(0);
        setPaymentNotes("");
        
        // Redirect to the checkout URL in the same tab
        window.location.href = response.data.checkoutUrl;
        
        // Refresh payment data after a short delay
        setTimeout(async () => {
          hasFetchedPaymentData.current = false;
          setPaymentSummary(null);
          setPaymentSchedule(null);
          
          if (selectedLoan.payableID) {
            try {
              const summary = await fetchPaymentSummary(selectedLoan.payableID);
              setPaymentSummary(summary);

              const schedule = await fetchPaymentSchedule(uid, selectedLoan.payableID);
              setPaymentSchedule(schedule);
            } catch (error) {
              // Failed to refresh payment data
            }
          }
        }, 2000);
      } else {
        // For non-ECash payments or ECash without checkout URL
        toast.success(`Payment of ₱${paymentAmount.toLocaleString()} recorded successfully`);
        setShowPaymentModal(false);
        setPaymentAmount(0);
        setPaymentNotes("");
        
        // Refresh payment data
        hasFetchedPaymentData.current = false;
        setPaymentSummary(null);
        setPaymentSchedule(null);
        
        // Trigger refetch of payment data
        if (selectedLoan.payableID) {
          try {
            const summary = await fetchPaymentSummary(selectedLoan.payableID);
            setPaymentSummary(summary);

            const schedule = await fetchPaymentSchedule(uid, selectedLoan.payableID);
            setPaymentSchedule(schedule);
          } catch (error) {
            // Failed to refresh payment data
          }
        }
      }
    } catch (error) {
      toast.error("Failed to record payment. Please try again.");
    }
  };

  useEffect(() => {
    const fetchApproved = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      try {
        const { uid } = JSON.parse(storedUser);
        const response = await submitLoanRequest("Approved", uid);

        if (response?.data?.length) {
          const loans = response.data.map((loan: any) => ({
            loanPurpose: loan.loanPurpose,
            type: loan.type,
            amount: loan.amount,
            interestRate: loan.interestRate,
            interestAmount: loan.interestAmount,
            lender: loan.lender,
            borrower: loan.borrower,
            agreementDate: new Date(loan.agreementDate).toLocaleDateString(
              "en-PH",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            ),
            status: loan.status,
            payableID: loan.payableID,
            paymentType: loan.paymentType,
          }));

          setApprovedLoans(loans);
        }
      } catch (err) {
        console.error("Error fetching approved loans:", err);
      }
    };

    fetchApproved();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">All Approved Loans</h3>
            <p className="text-gray-600 text-sm">View your approved loan history</p>
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
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interest Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agreement Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  Loading approved loans...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-red-500">
                  Error: {error}
                </td>
              </tr>
            )}
            {!loading && approvedLoans.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No approved loans found.
                </td>
              </tr>
            )}
            {approvedLoans.map((loan) => (
                <tr key={loan.payableID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#2c8068] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">
                          {loan.loanPurpose.charAt(0)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {loan.loanPurpose}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{loan.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.interestRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{loan.interestAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.lender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.agreementDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor[loan.status]}`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={() => handleViewLoan(loan)}
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

      {/* Modal */}
      {showModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Approved Loan Details
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
                    Loan Overview
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Loan Purpose</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {selectedLoan.loanPurpose}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Loan Type</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {selectedLoan.type}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Loan Amount</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      ₱{selectedLoan.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Interest Rate</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {selectedLoan.interestRate}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Interest Amount</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      ₱{selectedLoan.interestAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`mt-1 inline-block w-fit px-3 py-1 text-sm rounded-full font-medium ${statusColor[selectedLoan.status]}`}>
                      {selectedLoan.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Lender Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-2 h-5 rounded bg-blue-400" />
                  <span className="font-semibold text-sm text-gray-700">
                    Lender Information
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Lender Name</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {selectedLoan.lender}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Agreement Date</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {selectedLoan.agreementDate}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Payment Type</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {selectedLoan.paymentType}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Payable ID</span>
                    <span className="mt-1 text-gray-800 font-medium font-mono text-xs">
                      {selectedLoan.payableID}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Tracking */}
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
                        {summaryLoading ? (
                          "Loading..."
                        ) : paymentSummary ? (
                          `₱${paymentSummary.totalPayableAmount.toLocaleString()}`
                        ) : (
                          `₱${selectedLoan.amount.toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total Paid</span>
                      <span className="mt-1 text-gray-800 font-medium">
                        {summaryLoading ? (
                          "Loading..."
                        ) : paymentSummary ? (
                          `₱${paymentSummary.totalPaid.toLocaleString()}`
                        ) : (
                          "₱0.00"
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Remaining Balance</span>
                      <span className="mt-1 text-gray-800 font-medium">
                        {summaryLoading ? (
                          "Loading..."
                        ) : paymentSummary ? (
                          `₱${paymentSummary.remainingBalance.toLocaleString()}`
                        ) : (
                          `₱${selectedLoan.amount.toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Monthly Payment</span>
                      <span className="mt-1 text-gray-800 font-medium">
                        {scheduleLoading ? (
                          "Loading..."
                        ) : paymentSchedule ? (
                          `₱${paymentSchedule.monthlyPayment.toLocaleString()}`
                        ) : (
                          "N/A"
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Payment Type</span>
                      <span className="mt-1 text-gray-800 font-medium">
                        {selectedLoan.paymentType || "N/A"}
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
                      <div className="text-center text-gray-500 py-4">Loading payments...</div>
                    ) : paymentSchedule && paymentSchedule.schedule ? (
                      (() => {
                        const paidPayments = paymentSchedule.schedule.filter(
                          (item) => item.status === "Paid" || item.status === "Advance"
                        );
                        
                        return paidPayments.length > 0 ? (
                          paidPayments.map((payment, index) => (
                            <div key={`paid-${index}`} className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm text-green-600 font-medium">Due Date</p>
                                  <p className="text-gray-800 font-semibold">
                                    {new Date(payment.dueDate).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                  {payment.paymentDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Paid on: {new Date(payment.paymentDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-green-600 font-medium">Amount Due</p>
                                  <p className="text-green-700 font-bold text-lg">
                                    ₱{payment.actualPayment.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-4">No payments made yet</div>
                        );
                      })()
                    ) : (
                      <div className="text-center text-gray-500 py-4">No payment schedule available</div>
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
                    {selectedLoan.paymentType === "ECash" && (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="px-4 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors text-sm font-medium"
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3">
                    {scheduleLoading ? (
                      <div className="text-center text-gray-500 py-4">Loading schedule...</div>
                    ) : paymentSchedule && paymentSchedule.schedule ? (
                      (() => {
                        const unpaidPayments = paymentSchedule.schedule.filter(
                          (item) => item.status === "Unpaid" || item.status === "Advance Applied"
                        );
                        
                        return unpaidPayments.length > 0 ? (
                          unpaidPayments.map((payment, index) => (
                            <div key={`unpaid-${index}`} className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm text-red-600 font-medium">Due Date</p>
                                  <p className="text-gray-800 font-semibold">
                                    {new Date(payment.dueDate).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                  {payment.status === "Advance Applied" && (
                                    <p className="text-xs text-orange-600 mt-1 font-medium">
                                      Advance Applied
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-red-600 font-medium">
                                    {payment.status === "Advance Applied" ? "Amount Applied" : "Amount Due"}
                                  </p>
                                  <p className="text-red-700 font-bold text-lg">
                                    ₱{payment.status === "Advance Applied" 
                                      ? payment.actualPayment.toLocaleString() 
                                      : payment.requiredToPayEveryMonth.toLocaleString()
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-4">All payments completed!</div>
                        );
                      })()
                    ) : (
                      <div className="text-center text-gray-500 py-4">No payment schedule available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Record Payment</h2>
              
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
                    onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                    min={0}
                    step="0.01"
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
                    <div className="text-center text-gray-500 py-4">Loading payment history...</div>
                  ) : paymentSummary && paymentSummary.payments.length > 0 ? (
                    paymentSummary.payments.map((payment) => (
                      <div key={payment.paymentID} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-green-600 font-medium">Payment Date</p>
                            <p className="text-gray-800 font-semibold">
                              {new Date(payment.paymentDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-gray-600 mt-2">
                                <span className="font-medium">Notes:</span> {payment.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                            <p className="text-green-700 font-bold text-lg">
                              ₱{payment.amountPaid.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">No payment history available</div>
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
    </div>
  );
}
