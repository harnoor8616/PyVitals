const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, gender, email, password, dob, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            gender,
            email,
            password: hashedPassword,
            dob,
            role,
        });

        await newUser.save();

        res.json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ success: false, error: "Server error while registering user" });
    }
});

router.post("/check-email", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: "Email required" });

        const user = await User.findOne({ email });
        res.json({ success: true, exists: !!user });
    } catch (error) {
        console.error("Check email error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

router.post("/save-face", async (req, res) => {
    try {
        const { email, faceData } = req.body;
        if (!email || !faceData) return res.status(400).json({ success: false, error: "Email and face data required" });

        const user = await User.findOneAndUpdate({ email }, { faceData }, { new: true });
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        res.json({ success: true, message: "Face data saved successfully!" });
    } catch (error) {
        console.error("Save face error:", error);
        res.status(500).json({ success: false, error: "Server error while saving face data" });
    }
});

module.exports = router;
