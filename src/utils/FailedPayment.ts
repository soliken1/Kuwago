import emailjs from "emailjs-com";

const failedPayment = async (
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

We’re sorry to inform you that a recent payment attempt was **unsuccessful**.

Please double-check the details or ensure that the user has sufficient funds before trying again.  
They can retry the payment or review their billing information by visiting the dashboard at the link below:

${redirectUrl}
`,
  };

  await emailjs.send(
    "service_wmbofyj", // EmailJS Service ID
    "template_i1hctq8", // EmailJS Template ID
    templateParams,
    "OTKcxW7tWUSp9gqQH" // Your EmailJS Public Key
  );
};

export default failedPayment;
