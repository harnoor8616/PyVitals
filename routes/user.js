

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
router.get("/", (req, res) => {
    res.send("User route is working!");
});
// Register route
router.post("/register", async (req, res) => {
    try {
        let { firstName, lastName, gender, email, password, dob, role } = req.body;

        // Normalize input
        gender = gender ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : null;
        role = role ? role.toLowerCase() : null;

        // Validate required fields
        const missingFields = [];
        ["firstName", "lastName", "gender", "email", "password", "dob", "role"].forEach(field => {
            if (!req.body[field]) missingFields.push(field);
        });
        if (missingFields.length > 0) {
            return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(", ")}` });
        }

        // Validate gender and role enums
        if (!["Male", "Female", "Other"].includes(gender)) {
            return res.status(400).json({ success: false, error: `Invalid gender: ${gender}` });
        }
        if (!["doctor", "patient"].includes(role)) {
            return res.status(400).json({ success: false, error: `Invalid role: ${role}` });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: "Invalid email format" });
        }

        // Check if user exists
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ success: false, error: "Email already registered" });
            }
        } catch (dbCheckErr) {
            console.error("DB check error:", dbCheckErr);
            return res.status(500).json({ success: false, error: "Database error during email check" });
        }

        // Validate DOB
        const dobDate = new Date(dob);
        if (isNaN(dobDate.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid date of birth" });
        }

        // Hash password safely
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (hashErr) {
            console.error("Password hashing error:", hashErr);
            return res.status(500).json({ success: false, error: "Error processing password" });
        }

        // Create user
        const newUser = new User({ firstName, lastName, gender, email, password: hashedPassword, dob: dobDate, role });
        try {
            await newUser.save();
        } catch (saveErr) {
            console.error("User save error:", saveErr);
            if (saveErr.name === "ValidationError") {
                const messages = Object.values(saveErr.errors).map(e => e.message);
                return res.status(400).json({ success: false, error: messages.join(", ") });
            }
            if (saveErr.code === 11000 && saveErr.keyPattern.email) {
                return res.status(409).json({ success: false, error: "Email already registered" });
            }
            return res.status(500).json({ success: false, error: "Error saving user to database" });
        }

        res.status(201).json({ success: true, message: "User registered successfully!" });

    } catch (err) {
        console.error("Unexpected register error:", err);
        res.status(500).json({ success: false, error: "Unexpected server error" });
    }
});

module.exports = router;


module.exports = router;
