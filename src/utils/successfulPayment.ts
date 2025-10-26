import emailjs from "emailjs-com";

const successfulPayment = async (
  recipientEmail: string,
  recipientName: string,
  redirectUrl: string,
  subject: string
) => {
  const templateParams = {
    to_email: recipientEmail,
    to_name: recipientName,
    subject,
    message: `
Hi ${recipientName},

Great news! The payment has been successfully processed and confirmed. 🎉

You can view The updated loan balance, payment history, and transaction details anytime by visiting The dashboard at the link below:

${redirectUrl}
`,
  };

  await emailjs.send(
    "service_wmbofyj", // EmailJS Service ID
    "template_i1hctq8", // EmailJS Template ID
    templateParams,
    "OTKcxW7tWUSp9gqQH" // The EmailJS Public Key
  );
};

export default successfulPayment;
