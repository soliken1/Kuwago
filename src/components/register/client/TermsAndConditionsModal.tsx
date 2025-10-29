"use client";
import React from "react";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsAndConditionsModal({
  isOpen,
  onClose,
}: TermsAndConditionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 poppins-bold">
            Terms and Conditions & Privacy Policy
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6 text-sm text-gray-700">
            {/* Terms and Conditions */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 poppins-bold">
                Terms and Conditions
              </h3>
              <div className="space-y-3">
                <p>
                  <strong>1. Acceptance of Terms</strong><br />
                  By using Kuwago's lending and borrowing platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                </p>
                
                <p>
                  <strong>2. Platform Services</strong><br />
                  Kuwago provides a digital platform that connects lenders and borrowers for peer-to-peer lending transactions. We facilitate the matching process but are not a direct lender or borrower.
                </p>
                
                <p>
                  <strong>3. User Responsibilities</strong><br />
                  • Provide accurate and complete information during registration<br />
                  • Maintain the confidentiality of your account credentials<br />
                  • Comply with all applicable laws and regulations<br />
                  • Use the platform only for legitimate lending/borrowing purposes
                </p>
                
                <p>
                  <strong>4. Lending Terms</strong><br />
                  • Lenders must verify their identity and financial capacity<br />
                  • Interest rates and terms are agreed upon between parties<br />
                  • Kuwago charges a service fee for successful transactions<br />
                  • All loans are subject to our risk assessment procedures
                </p>
                
                <p>
                  <strong>5. Borrowing Terms</strong><br />
                  • Borrowers must provide valid business information and documentation<br />
                  • Creditworthiness will be assessed before loan approval<br />
                  • Repayment terms must be strictly adhered to<br />
                  • Late payments may incur additional fees
                </p>
                
                <p>
                  <strong>6. Risk Disclosure</strong><br />
                  • Peer-to-peer lending involves financial risks<br />
                  • There is no guarantee of loan repayment<br />
                  • Past performance does not guarantee future results<br />
                  • Users should only invest/borrow what they can afford to lose
                </p>
                
                <p>
                  <strong>7. Prohibited Activities</strong><br />
                  • Money laundering or illegal financial activities<br />
                  • Providing false or misleading information<br />
                  • Circumventing platform security measures<br />
                  • Harassment or inappropriate communication
                </p>
                
                <p>
                  <strong>8. Limitation of Liability</strong><br />
                  Kuwago shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our platform or any lending/borrowing transactions.
                </p>
                
                <p>
                  <strong>9. Termination</strong><br />
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities.
                </p>
                
                <p>
                  <strong>10. Governing Law</strong><br />
                  These terms are governed by the laws of the Philippines and any disputes will be resolved in Philippine courts.
                </p>
              </div>
            </section>

            {/* Privacy Policy */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 poppins-bold">
                Privacy Policy
              </h3>
              <div className="space-y-3">
                <p>
                  <strong>1. Information We Collect</strong><br />
                  • Personal identification information (name, email, phone number)<br />
                  • Financial information for verification purposes<br />
                  • Business information for borrowers<br />
                  • Transaction history and communication records
                </p>
                
                <p>
                  <strong>2. How We Use Your Information</strong><br />
                  • To verify your identity and eligibility<br />
                  • To facilitate lending and borrowing transactions<br />
                  • To provide customer support and improve our services<br />
                  • To comply with legal and regulatory requirements
                </p>
                
                <p>
                  <strong>3. Information Sharing</strong><br />
                  • We may share information with verified lenders/borrowers for transaction purposes<br />
                  • We may share data with third-party service providers under strict confidentiality agreements<br />
                  • We will not sell your personal information to third parties
                </p>
                
                <p>
                  <strong>4. Data Security</strong><br />
                  • We implement industry-standard security measures<br />
                  • All data is encrypted during transmission and storage<br />
                  • Access to personal information is restricted to authorized personnel only
                </p>
                
                <p>
                  <strong>5. Your Rights</strong><br />
                  • Access and update your personal information<br />
                  • Request deletion of your account and data<br />
                  • Opt-out of marketing communications<br />
                  • Request a copy of your data
                </p>
                
                <p>
                  <strong>6. Cookies and Tracking</strong><br />
                  We use cookies and similar technologies to improve your experience and analyze platform usage.
                </p>
                
                <p>
                  <strong>7. Data Retention</strong><br />
                  We retain your information for as long as necessary to provide services and comply with legal obligations.
                </p>
                
                <p>
                  <strong>8. Updates to Privacy Policy</strong><br />
                  We may update this privacy policy from time to time. Users will be notified of significant changes.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 poppins-bold">
                Contact Information
              </h3>
              <p>
                For questions about these Terms and Conditions or Privacy Policy, please contact us at:<br />
                Email: legal@kuwago.com<br />
                Phone: +63 (0) 2 1234 5678<br />
                Address: 123 Business District, Makati City, Philippines
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white font-medium rounded-lg transition duration-200"
            style={{ backgroundColor: '#85d4a4' }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6bc48a'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#85d4a4'}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
