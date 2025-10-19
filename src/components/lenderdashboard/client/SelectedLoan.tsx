"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import X from "../../../../assets/actions/X";
import sendDocumentLink from "@/utils/document/send";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-300",
  Approved: "bg-green-100 text-green-700 border border-green-300",
  Denied: "bg-red-100 text-red-700 border border-red-300",
  Completed: "bg-gray-100 text-gray-700 border border-gray-300",
};
interface Props {
  selectedLoan: any;
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
  storedUser: any;
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
  const [paymentType, setPaymentType] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState<boolean>(false);
  const handleApprove = async () => {
    const confirm = window.confirm(
      `Are you sure you want to approve this loan with ₱${finalAmount}, an Interest of ${interestRate}%, Terms of Month of ${termsOfMonths} Months and a Payment Method of ${
        paymentType === 1 ? "Cash" : "ECash"
      }?`
    );
    if (!confirm) return;

    try {
      // Update status first
      updateLoanStatus(
        selectedLoan.loanInfo.loanRequestID,
        "Approved",
        finalAmount,
        interestRate,
        termsOfMonths,
        paymentType
      );

      // 🟢 PandaDoc API details
      const apiKey = "3412a8f0af977fc4b1b750173c3875d7ee58d26a";
      const templateId = "QjGqLCwEvbvAWa4c9QFTfU";

      const payload = {
        name: "Loan Approval Test Document",
        template_uuid: templateId,
        recipients: [
          {
            email: selectedLoan.userInfo.email,
            first_name: selectedLoan.loanInfo.firstName,
            last_nname: selectedLoan.loanInfo.lastName,
            role: "Borrower",
          },
          {
            email: storedUser.email,
            first_name: storedUser.fullname,
            role: "Lender",
          },
        ],
        tokens: [], // Optional if template uses token placeholders
        fields: {}, // Optional if filling fields dynamically
        metadata: {
          loanId: selectedLoan.loanInfo.loanRequestID,
        },
        send_email: true,
      };

      const response = await axios.post(
        "https://api.pandadoc.com/public/v1/documents",
        payload,
        {
          headers: {
            Authorization: `API-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const url = `https://app.pandadoc.com/a/#/documents/${response.data.uuid}`;
      await sendDocumentLink(
        storedUser.email,
        storedUser.fullname,
        url,
        `Generated Document For ${selectedLoan.loanInfo.firstName} ${selectedLoan.loanInfo.lastName}`
      );
      toast.success("Loan approved and document sent to recipients.");
      window.location.reload();
    } catch (error) {
      console.error("PandaDoc error", error);
      toast.error("Loan approved but failed to send document.");
    }
  };

  const handleDeny = () => {
    const confirm = window.confirm("Are you sure you want to deny this loan?");
    if (!confirm) return;
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

  const handlePaymentSubmit = () => {
    if (paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    // TODO: Replace with real API call to record payment
    toast.success(`Payment of ₱${paymentAmount.toLocaleString()} recorded successfully`);
    setShowPaymentModal(false);
    setPaymentAmount(0);
    // window.location.reload(); // Uncomment when real API is implemented
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
                  {selectedLoan.userInfo.firstName} {selectedLoan.userInfo.lastName}
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
                  {selectedLoan.loanInfo.loanType}
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
                <span className={`mt-1 inline-block w-fit px-3 py-1 text-sm rounded-full font-medium ${statusColor[selectedLoan.loanInfo.loanStatus as keyof typeof statusColor] || statusColor.Pending}`}>
                  {selectedLoan.loanInfo.loanStatus === "InProgress" ? "In Progress" : selectedLoan.loanInfo.loanStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-blue-400" />
              <span className="font-semibold text-sm text-gray-700">
                Personal Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Education</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {selectedLoan.loanInfo.highestEducation}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Address</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {selectedLoan.loanInfo.detailedAddress}
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
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={interestRate === 0 ? "" : interestRate}
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c8068]"
                    onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    Terms of Months
                  </label>
                  <div className="flex gap-2 mt-1">
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        termsOfMonths === 3 
                          ? 'bg-[#2c8068] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setTermsOfMonths(3)}
                    >
                      3 Months
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        termsOfMonths === 6 
                          ? 'bg-[#2c8068] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setTermsOfMonths(6)}
                    >
                      6 Months
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        termsOfMonths === 9 
                          ? 'bg-[#2c8068] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setTermsOfMonths(9)}
                    >
                      9 Months
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        termsOfMonths === 12 
                          ? 'bg-[#2c8068] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setTermsOfMonths(12)}
                    >
                      12 Months
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    Payment Type
                  </label>
                  <div className="flex gap-2 mt-1">
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        paymentType === 1 
                          ? 'bg-[#2c8068] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setPaymentType(1)}
                    >
                      Cash
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        paymentType === 2 
                          ? 'bg-[#2c8068] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setPaymentType(2)}
                    >
                      ECash
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Payment Tracking (if Approved/Completed) */}
          {(selectedLoan.loanInfo.loanStatus === "Approved" || selectedLoan.loanInfo.loanStatus === "Completed") && (
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
                      ₱{selectedLoan.loanInfo.loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Total Paid</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      ₱7,500.00
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Remaining Balance</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      ₱2,500.00
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
                  {/* TODO: Replace with real API data */}
                  {/* Dummy data for Paid payments */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Payment Date</p>
                        <p className="text-gray-800 font-semibold">January 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                        <p className="text-green-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Payment Date</p>
                        <p className="text-gray-800 font-semibold">February 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                        <p className="text-green-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Payment Date</p>
                        <p className="text-gray-800 font-semibold">March 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                        <p className="text-green-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unpaid Payments Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    Unpaid Payments
                  </h3>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors text-sm font-medium"
                  >
                    Record Payment
                  </button>
                </div>
                <div className="grid gap-3">
                  {/* TODO: Replace with real API data */}
                  {/* Dummy data for Unpaid payments */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-red-600 font-medium">Due Date</p>
                        <p className="text-gray-800 font-semibold">April 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-600 font-medium">Amount Due</p>
                        <p className="text-red-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-red-600 font-medium">Due Date</p>
                        <p className="text-gray-800 font-semibold">May 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-600 font-medium">Amount Due</p>
                        <p className="text-red-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-red-600 font-medium">Due Date</p>
                        <p className="text-gray-800 font-semibold">June 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-600 font-medium">Amount Due</p>
                        <p className="text-red-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>
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
            {/* Payment Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Record Payment
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>

            {/* Payment Modal Content */}
            <div className="p-6 space-y-4">

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

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> This will record a payment for the selected loan. 
                  The payment will be added to the borrower's payment history.
                </p>
              </div>
            </div>

            {/* Payment Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="px-6 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors"
              >
                Record Payment
              </button>
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
                
                {/* TODO: Replace with real API data */}
                {/* Dummy payment history data */}
                <div className="grid gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Payment Date</p>
                        <p className="text-gray-800 font-semibold">January 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                        <p className="text-green-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Payment Date</p>
                        <p className="text-gray-800 font-semibold">February 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                        <p className="text-green-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Payment Date</p>
                        <p className="text-gray-800 font-semibold">March 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                        <p className="text-green-700 font-bold text-lg">₱2,500.00</p>
                      </div>
                    </div>
                  </div>
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
