// utils/mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendLoginAlert = async (toEmail, deviceInfo = "Unknown device") => {
  const mailOptions = {
    from: `"Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "New Login Detected 🚨",
    html: `
      <h3>Hello,</h3>
      <p>We detected a login to your account from a new device or location.</p>
      <p><b>Device:</b> ${deviceInfo}</p>
      <p>If this was you, no action is needed.</p>
      <p>If not, we recommend you change your password immediately.</p>
      <br/>
      <p>– Flaura Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Login alert sent.");
  } catch (err) {
    console.error("Email send error:", err);
  }
};

module.exports = { sendLoginAlert };
