import emailjs from "emailjs-com";

interface PayableDueSoonData {
  payableID: string;
  borrowerUID: string;
  lenderUID: string;
  loanRequestID: string;
  totalPayableAmount: number;
  paymentPerMonth: number;
  paymentType: string;
  nextPaymentDueDate: string;
  daysUntilDue: number;
  notified: boolean;
  lastNotifiedDate: string | null;
  notifiedAt: string | null;
  borrowerInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

export const notifyDueSoon = async (
  payable: PayableDueSoonData,
  redirectUrl: string
) => {
  const {
    paymentPerMonth,
    nextPaymentDueDate,
    daysUntilDue,
    totalPayableAmount,
    paymentType,
    borrowerInfo,
  } = payable;

  // Format the amount in Philippine Peso
  const formattedAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(paymentPerMonth);

  const formattedTotal = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(totalPayableAmount);

  // Format the due date
  const dueDate = new Date(nextPaymentDueDate);
  const formattedDueDate = dueDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine urgency message based on days until due
  let urgencyMessage = "";
  let subject = "";

  if (daysUntilDue === 0) {
    urgencyMessage = "⚠️ **URGENT: Your payment is due TODAY!**";
    subject = "🚨 Payment Due TODAY - Immediate Action Required";
  } else if (daysUntilDue === 1) {
    urgencyMessage = "⚠️ **Your payment is due TOMORROW!**";
    subject = "⏰ Payment Due Tomorrow - Reminder";
  } else if (daysUntilDue === 2) {
    urgencyMessage = "Your payment is due in 2 days.";
    subject = "📅 Payment Due in 2 Days - Reminder";
  } else if (daysUntilDue === 3) {
    urgencyMessage = "Your payment is due in 3 days.";
    subject = "💡 Payment Due Soon - Friendly Reminder";
  } else {
    urgencyMessage = `Your payment is due in ${daysUntilDue} days.`;
    subject = `📌 Payment Due in ${daysUntilDue} Days - Reminder`;
  }

  const templateParams = {
    to_email: borrowerInfo.email,
    to_name: borrowerInfo.fullName,
    subject,
    message: `
Hi ${borrowerInfo.firstName},

${urgencyMessage}

This is a friendly reminder that your loan payment is approaching its due date.

**Payment Details:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Amount Due: ${formattedAmount}
• Due Date: ${formattedDueDate}
• Payment Type: ${paymentType}
• Total Loan Amount: ${formattedTotal}
• Days Until Due: ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To avoid late fees and maintain a good payment history, please ensure your payment is made on or before the due date.

You can make your payment by visiting your dashboard:
${redirectUrl}

**Need Help?**
If you have any questions or concerns about your payment, please don't hesitate to contact us.

Thank you for your prompt attention to this matter!

Best regards,
The Kuwago Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated reminder. Please do not reply to this email.
If you've already made this payment, please disregard this message.
    `.trim(),
  };

  try {
    await emailjs.send(
      "service_wmbofyj", // EmailJS Service ID
      "template_i1hctq8", // EmailJS Template ID
      templateParams,
      "OTKcxW7tWUSp9gqQH" // Your EmailJS Public Key
    );
    console.log(`✅ Payment reminder sent to ${borrowerInfo.email}`);
  } catch (error) {
    console.error(
      `❌ Failed to send reminder to ${borrowerInfo.email}:`,
      error
    );
    throw error;
  }
};
