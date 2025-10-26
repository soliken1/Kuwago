import emailjs from "emailjs-com";

const notifyAcknowledgeLoan = async (
  borrowerEmail: string,
  borrowerName: string,
  redirectUrl: string,
  subject: string
) => {
  const templateParams = {
    to_email: borrowerEmail,
    to_name: borrowerName,
    subject,
    message: `
Hi ${borrowerName},

We’re pleased to inform you that your loan application has been successfully acknowledged and is now under review.

You can track the status of your loan, view details, and manage your application by visiting your dashboard at the link below:

${redirectUrl}

Thank you for choosing Kuwago — we appreciate your trust in our platform.

Best regards,  
The Kuwago Team
`,
  };

  await emailjs.send(
    "service_wmbofyj", // EmailJS Service ID
    "template_i1hctq8", // EmailJS Template ID
    templateParams,
    "OTKcxW7tWUSp9gqQH" // Your EmailJS Public Key
  );
};

export default notifyAcknowledgeLoan;
