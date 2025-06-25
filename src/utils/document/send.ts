import emailjs from "emailjs-com";

const sendDocumentLink = async (
  lenderEmail: string,
  lenderName: string,
  documentUrl: string,
  subject: string
) => {
  const templateParams = {
    to_email: lenderEmail,
    to_name: lenderName,
    subject,
    message: `Hello Lender ${lenderName},\n\nPlease Review The Documents Before Sending This To The Borrower For Their Signature and Review:\n${documentUrl}\n\nIf you did not request this, please ignore this email.`,
  };

  await emailjs.send(
    "service_wmbofyj",
    "template_i1hctq8",
    templateParams,
    "OTKcxW7tWUSp9gqQH"
  );
};

export default sendDocumentLink;
