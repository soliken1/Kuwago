import emailjs from "emailjs-com";

const sendEmailWithLink = async (
  ownerEmail: string,
  ownerName: string,
  downloadURL: string,
  subject: string
) => {
  const templateParams = {
    to_email: ownerEmail,
    to_name: ownerName,
    subject,
    message: `Hi ${ownerName},\n\nClick the link below to reset your password:\n${downloadURL}\n\nIf you did not request this, please ignore this email.`,
  };

  await emailjs.send(
    "service_wmbofyj", // EmailJS Service ID
    "template_i1hctq8", // EmailJS Template ID
    templateParams,
    "OTKcxW7tWUSp9gqQH" // Your EmailJS Public Key
  );
};

export default sendEmailWithLink;

