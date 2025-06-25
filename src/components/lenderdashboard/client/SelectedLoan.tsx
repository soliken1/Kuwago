"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import X from "../../../../assets/actions/X";

interface Props {
  selectedLoan: any;
  closeModal: () => void;
  sendMessage: () => void;
  updateLoanStatus: (
    loanRequestID: string,
    loanStatus: string,
    loanAmount: number
  ) => void;
}

export default function SelectedLoan({
  selectedLoan,
  closeModal,
  sendMessage,
  updateLoanStatus,
}: Props) {
  const [finalAmount, setFinalAmount] = useState<number>(
    selectedLoan.loanInfo.loanAmount
  );

  const handleApprove = () => {
    const confirm = window.confirm(
      `Are you sure you want to approve this loan with ₱${finalAmount}?`
    );
    if (!confirm) return;
    updateLoanStatus(
      selectedLoan.loanInfo.loanRequestID,
      "Approved",
      finalAmount
    );
    window.location.reload();
    toast.success("Loan approved");
  };

  const handleDeny = () => {
    const confirm = window.confirm("Are you sure you want to deny this loan?");
    if (!confirm) return;
    updateLoanStatus(
      selectedLoan.loanInfo.loanRequestID,
      "Denied",
      selectedLoan.loanInfo.loanAmount
    );
    window.location.reload();
    toast.error("Loan denied");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Loan Request Details</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-800 transition"
          >
            <X />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Applicant:</span>{" "}
            {selectedLoan.userInfo.firstName} {selectedLoan.userInfo.lastName}
          </div>
          <div>
            <span className="font-semibold">Email:</span>{" "}
            {selectedLoan.userInfo.email}
          </div>
          <div>
            <span className="font-semibold">Original Amount:</span> ₱
            {selectedLoan.loanInfo.loanAmount}
          </div>

          {selectedLoan.loanInfo.loanStatus === "InProgress" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Final Loan Amount (₱)
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={finalAmount}
                onChange={(e) => setFinalAmount(Number(e.target.value))}
                min={0}
              />
            </div>
          )}

          <div>
            <span className="font-semibold">Type:</span>{" "}
            {selectedLoan.loanInfo.loanType}
          </div>
          <div>
            <span className="font-semibold">Purpose:</span>{" "}
            {selectedLoan.loanInfo.loanPurpose}
          </div>
          <div>
            <span className="font-semibold">Address:</span>{" "}
            {selectedLoan.loanInfo.detailedAddress}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Requested: {selectedLoan.loanInfo.createdAt}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={closeModal}
            className="text-gray-600 hover:text-black text-sm"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            {selectedLoan.loanInfo.loanStatus === "InProgress" && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={handleDeny}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Deny
                </button>
              </>
            )}

            {(selectedLoan.loanInfo.loanStatus === "Pending" ||
              selectedLoan.loanInfo.loanStatus === "Denied") && (
              <button
                onClick={sendMessage}
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Send a Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
