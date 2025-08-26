// //  1. Load env variables first

// require('dotenv').config();


// const express = require('express');
// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");

// const PORT = process.env.PORT || 5000;



// const twilio = require('twilio');

// //  3. Setup express after imports
// const app = express();
// const port = process.env.PORT || 3000;

// PORT = 5000

// // 4. Setup Twilio client after loading env
// const client = twilio(
//     process.env.TWILIO_SID,
//     process.env.TWILIO_AUTH_TOKEN
// );
// console.log("FULL ENV:", process.env);
// console.log("SID:", process.env.TWILIO_SID);
// console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN);

// const YOUR_PHONE_NUMBER = '+917696784809';       // Your number to receive SMS
// const TWILIO_PHONE_NUMBER = '+18585670714';       // Twilio number assigned to you

// app.use(cors());
// app.use(bodyParser.json());

// app.post('/send-sms', async (req, res) => {
//     const { name, email, company, message } = req.body;

//     const smsText = `
// New Contact Form Submission:
// Name: ${name}
// Email: ${email}
// Company: ${company || "N/A"}
// Message: ${message}
//     `.trim(); // Removes leading spaces

//     try {
//         await client.messages.create({
//             body: smsText,
//             from: TWILIO_PHONE_NUMBER, // Must be string
//             to: YOUR_PHONE_NUMBER      // Must be string
//         });

//         res.json({ success: true });
//     } catch (err) {
//         console.error(err.message);
//         res.json({ success: false, error: err.message });
//     }
// });

// app.listen(port, () => {
//     console.log(`✅ Server running on http://localhost:${port}`);
// });
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
//     .then(() => console.log('✅ MongoDB connected'))
//     .catch(err => console.error('❌ MongoDB connection error:', err));

// // 9. User routes
// app.use('/api/users', userRoutes);

// // 10. Start the server
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
// const mongoose = require('mongoose');
// require('dotenv').config();

// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log("✅ MongoDB connected"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// 1. Load env variables
require("dotenv").config();

// 2. Imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const userRoutes = require("./routes/user.js");

// 3. Setup
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Middleware
app.use(cors());
app.use(bodyParser.json());

// 5. Twilio client
const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const YOUR_PHONE_NUMBER = "+917696784809"; // change to your phone
const TWILIO_PHONE_NUMBER = "+18585670714"; // Twilio phone

// 6. Routes
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

// 7. MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// 8. User routes
app.use("/api/users", userRoutes);

// 9. Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
