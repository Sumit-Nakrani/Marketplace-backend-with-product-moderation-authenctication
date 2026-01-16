const sendEmail = require("../utils/email");

exports.sendTestMail = async (req, res) => {
      console.log("SEND MAIL API HIT")
  await sendEmail({
    to: "testuser@gmail.com",
    subject: "Mailtrap Test Email",
    text: "Hello! Ye Mailtrap se test mail hai",
    html: "<h2>Hello!</h2><p>Mailtrap test successful 🚀</p>",
  });

  res.status(200).json({
    success: true,
    message: "Email sent successfully (Mailtrap)",
  });
};
