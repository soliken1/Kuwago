"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import X from "../../../../assets/actions/X";
import sendDocumentLink from "@/utils/document/send";
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
  const [termsOfMonths, setTermsOfMonths] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<number>(0);
  const handleApprove = async () => {
    const confirm = window.confirm(
      `Are you sure you want to approve this loan with ₱${finalAmount}, an Interest of ${interestRate}%, Terms of Month of ${termsOfMonths} and a Payment Method of ${
        paymentType === 1 ? "On-Hand" : "Online"
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
            <div className="flex flex-col gap-2">
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Terms of Months
                </label>
                <input
                  type="number"
                  value={termsOfMonths}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={(e) => setTermsOfMonths(Number(e.target.value))}
                  min={0}
                  max={32}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Type
                </label>
                <div className="flex flex-row justify-evenly">
                  <button
                    className={`${paymentType === 1 ? "bg-green-500" : ""}`}
                    onClick={() => setPaymentType(1)}
                  >
                    On-Hand
                  </button>
                  <button
                    className={`${paymentType === 0 ? "bg-green-500" : ""}`}
                    onClick={() => setPaymentType(0)}
                  >
                    Online
                  </button>
                </div>
              </div>
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
