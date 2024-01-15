import nodemailer from "nodemailer";

const sendVerificationEmail = async (
  email: string,
  emailVerificationToken: string
) => {
  // Create transporter object using default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send email using transporter object
  const info = await transporter.sendMail({
    from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_SENDER_ADDRESS}>`,
    to: email,
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link: ${process.env.APP_URL}/verify-email?token=${emailVerificationToken}`,
    html: `<p>Please verify your email by clicking on the following link: <a href="${process.env.APP_URL}/verify-email?token=${emailVerificationToken}">Verify Email</a></p>`,
  });

  console.log(`Message sent: ${info.messageId}`);
};

export default sendVerificationEmail;