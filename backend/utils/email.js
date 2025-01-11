const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1 ) Create a transporter

  const transporter = nodeMailer.createTransport({
    secure: true,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the eamil options

  const mailOptions = {
    from: `Penny Partner <${process.env.EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
