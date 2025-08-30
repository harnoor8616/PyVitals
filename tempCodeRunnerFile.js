require("dotenv").config();

// ==========================
// Imports
// ==========================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const userRoutes = require("./routes/user.js");

// ==========================
// App Setup
// ==========================
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(bodyParser.json());

// ==========================
// Twilio SMS Code
// ==========================
const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const YOUR_PHONE_NUMBER = "+917696784809"; // change to your phone
const TWILIO_PHONE_NUMBER = "+18585670714"; // Twilio phone

app.post("/send-sms", async (req, res) => {
    const { name, email, company, message } = req.body;

    const smsText = `
New Contact Form Submission:
Name: ${name}
Email: ${email}
Company: ${company || "N/A"}
Message: ${message}
    `.trim();

    try {
        await client.messages.create({
            body: smsText,
            from: TWILIO_PHONE_NUMBER,
            to: YOUR_PHONE_NUMBER
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.json({ success: false, error: err.message });
    }
});

// ==========================
// MongoDB + User Routes
// ==========================
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

app.use("/api/users", userRoutes);

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
