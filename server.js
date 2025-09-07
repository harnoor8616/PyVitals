// // require("dotenv").config();
// // const express = require("express");
// // const mongoose = require("mongoose");
// // const cors = require("cors");
// // const bodyParser = require("body-parser");
// // const twilio = require("twilio");
// // const userRoutes = require("./routes/user.js");

// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // Middleware
// // app.use(cors());
// // app.use(bodyParser.json());
// // app.use(express.json({ limit: "10mb" }));

// // mongoose.connect(process.env.MONGO_URI, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true
// // })
// //     .then(() => console.log("MongoDB connected"))
// //     .catch(err => console.log("MongoDB connection error:", err));

// // mongoose.connect(process.env.MONGO_URI)
// //     .then(() => console.log("✅ MongoDB connected"))
// //     .catch((err) => {
// //         console.error("❌ MongoDB error:", err);
// //         process.exit(1);
// //     });

// // // Twilio setup
// // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// // const YOUR_PHONE_NUMBER = "+917696784809";
// // const TWILIO_PHONE_NUMBER = "+18585670714";

// // // Contact form SMS route
// // app.post("/send-sms", async (req, res) => {
// //     const { name, email, company, message } = req.body;
// //     const smsText = `
// // New Contact Form Submission:
// // Name: ${name}
// // Email: ${email}
// // Company: ${company || "N/A"}
// // Message: ${message}
// //     `.trim();

// //     try {
// //         await client.messages.create({
// //             body: smsText,
// //             from: TWILIO_PHONE_NUMBER,
// //             to: YOUR_PHONE_NUMBER,
// //         });
// //         res.json({ success: true, message: "SMS sent successfully!" });
// //     } catch (err) {
// //         console.error("❌ SMS error:", err.message);
// //         res.status(500).json({ success: false, error: "Failed to send SMS" });
// //     }
// // });

// // // User routes
// // app.use("/api/users", userRoutes);

// // // Health check (optional)
// // app.get("/", (req, res) => {
// //     res.send("✅ Server is up and running");
// // });

// // // Start server
// // app.listen(PORT, () => {
// //     console.log(`🚀 Server running on http://localhost:${PORT}`);
// // });
// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const helmet = require("helmet");
// const twilio = require("twilio");
// const userRoutes = require("./routes/user.js");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Validate environment variables
// const requiredEnvVars = ["MONGO_URI", "TWILIO_SID", "TWILIO_AUTH_TOKEN"];
// const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// if (missingEnvVars.length > 0) {
//     console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
//     process.exit(1);
// }

// // Middleware
// app.use(helmet()); // Security headers
// app.use(cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true
// }));
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// // MongoDB connection (only once)
// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
//     .then(() => console.log("✅ MongoDB connected"))
//     .catch((err) => {
//         console.error("❌ MongoDB connection error:", err);
//         process.exit(1);
//     });

// // Twilio setup with validation
// let client;
// let twilioInitialized = false;

// try {
//     client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
//     twilioInitialized = true;
//     console.log("✅ Twilio initialized successfully");
// } catch (err) {
//     console.error("❌ Twilio initialization error:", err.message);
//     twilioInitialized = false;
// }

// // Contact form SMS route with validation
// app.post("/send-sms", async (req, res) => {
//     // Validate Twilio is initialized
//     if (!twilioInitialized) {
//         return res.status(500).json({
//             success: false,
//             error: "SMS service not configured properly"
//         });
//     }

//     // Validate request body
//     const { name, email, company, message } = req.body;

//     if (!name || !email || !message) {
//         return res.status(400).json({
//             success: false,
//             error: "Name, email, and message are required"
//         });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//         return res.status(400).json({
//             success: false,
//             error: "Please provide a valid email address"
//         });
//     }

//     const smsText = `
// New Contact Form Submission:
// Name: ${name}
// Email: ${email}
// Company: ${company || "N/A"}
// Message: ${message}
//     `.trim();

//     try {
//         await client.messages.create({
//             body: smsText,
//             from: process.env.TWILIO_PHONE_NUMBER || "+18585670714",
//             to: process.env.YOUR_PHONE_NUMBER || "+917696784809",
//         });

//         console.log("✅ SMS sent successfully");
//         res.json({ success: true, message: "SMS sent successfully!" });
//     } catch (err) {
//         console.error("❌ SMS error:", err.message);
//         res.status(500).json({
//             success: false,
//             error: "Failed to send SMS",
//             details: process.env.NODE_ENV === "development" ? err.message : undefined
//         });
//     }
// });

// // User routes
// app.use("/api/users", userRoutes);

// // Health check endpoint
// app.get("/health", (req, res) => {
//     res.status(200).json({
//         status: "OK",
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime(),
//         database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
//     });
// });

// // Root endpoint
// app.get("/", (req, res) => {
//     res.send("✅ Server is up and running");
// });

// // 404 handler
// app.use((req, res) => {
//     res.status(404).json({ success: false, error: "Route not found" });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//     console.error("🛑 Unhandled error:", err);
//     res.status(500).json({
//         success: false,
//         error: "Internal server error",
//         details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
// });

// // Start server
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

// // Graceful shutdown
// process.on("SIGINT", async () => {
//     console.log("🛑 Shutting down server gracefully");
//     await mongoose.connection.close();
//     process.exit(0);
// });
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const twilio = require("twilio");
const userRoutes = require("./routes/user.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Validate environment variables
const requiredEnvVars = ["MONGO_URI", "TWILIO_SID", "TWILIO_AUTH_TOKEN"];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
    process.exit(1);
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB connection (updated without deprecated options)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// Twilio setup with validation
let client;
let twilioInitialized = false;

try {
    client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    twilioInitialized = true;
    console.log("✅ Twilio initialized successfully");
} catch (err) {
    console.error("❌ Twilio initialization error:", err.message);
    twilioInitialized = false;
}

// Contact form SMS route with validation
app.post("/send-sms", async (req, res) => {
    // Validate Twilio is initialized
    if (!twilioInitialized) {
        return res.status(500).json({
            success: false,
            error: "SMS service not configured properly"
        });
    }

    // Validate request body
    const { name, email, company, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: "Name, email, and message are required"
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: "Please provide a valid email address"
        });
    }

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
            from: process.env.TWILIO_PHONE_NUMBER || "+18585670714",
            to: process.env.YOUR_PHONE_NUMBER || "+917696784809",
        });

        console.log("✅ SMS sent successfully");
        res.json({ success: true, message: "SMS sent successfully!" });
    } catch (err) {
        console.error("❌ SMS error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to send SMS",
            details: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
});

// User routes
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.send("✅ Server is up and running");
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("🛑 Unhandled error:", err);
    res.status(500).json({
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("🛑 Shutting down server gracefully");
    await mongoose.connection.close();
    process.exit(0);
});