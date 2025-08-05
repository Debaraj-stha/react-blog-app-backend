const nodemailer = require("nodemailer");


const sendMail = async ({ from, to, subject, text, html }) => {
 
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // your Gmail address
        pass: process.env.GMAIL_PASSWORD, // your Gmail app password
      },
    });

    const mailOptions = {
      from,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email sending error:", error.message);
    throw error;
  }
};

module.exports = sendMail;
