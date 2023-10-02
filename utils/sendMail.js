const nodemailer = require("nodemailer");

const sendMail = async ({ email, subject, message, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    subject: subject,
    html: html,
    text: message,
    to: email,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
