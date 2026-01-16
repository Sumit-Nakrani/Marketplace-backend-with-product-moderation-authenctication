const client = require("../utils/sms");

exports.sendSMS = async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: "Phone number and message are required",
      });
    }

    const sms = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body: message,
    });

    res.json({
      success: true,
      sid: sms.sid,
      status: sms.status,
    });
  } catch (error) {
    console.error("SMS error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send SMS",
    });
  }
};
