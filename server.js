//  1. Load env variables first
require('dotenv').config();

//  2. Now import packages
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

//  3. Setup express after imports
const app = express();
const port = process.env.PORT || 3000;

// 4. Setup Twilio client after loading env
const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);
console.log("FULL ENV:", process.env);
console.log("SID:", process.env.TWILIO_SID);
console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN);

const YOUR_PHONE_NUMBER = '+917696784809';       // Your number to receive SMS
const TWILIO_PHONE_NUMBER = '+18585670714';       // Twilio number assigned to you

app.use(cors());
app.use(bodyParser.json());

app.post('/send-sms', async (req, res) => {
    const { name, email, company, message } = req.body;

    const smsText = `
New Contact Form Submission:
Name: ${name}
Email: ${email}
Company: ${company || "N/A"}
Message: ${message}
    `.trim(); // Removes leading spaces

    try {
        await client.messages.create({
            body: smsText,
            from: TWILIO_PHONE_NUMBER, // Must be string
            to: YOUR_PHONE_NUMBER      // Must be string
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.json({ success: false, error: err.message });
    }
});

app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
