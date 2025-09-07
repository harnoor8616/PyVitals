

// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const User = require("../models/User");
// router.get("/", (req, res) => {
//     res.send("User route is working!");
// });
// // Register route
// router.post("/register", async (req, res) => {
//     try {
//         let { firstName, lastName, gender, email, password, dob, role } = req.body;

//         // Normalize input
//         gender = gender ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : null;
//         role = role ? role.toLowerCase() : null;

//         // Validate required fields
//         const missingFields = [];
//         ["firstName", "lastName", "gender", "email", "password", "dob", "role"].forEach(field => {
//             if (!req.body[field]) missingFields.push(field);
//         });
//         if (missingFields.length > 0) {
//             return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(", ")}` });
//         }

//         // Validate gender and role enums
//         if (!["Male", "Female", "Other"].includes(gender)) {
//             return res.status(400).json({ success: false, error: `Invalid gender: ${gender}` });
//         }
//         if (!["doctor", "patient"].includes(role)) {
//             return res.status(400).json({ success: false, error: `Invalid role: ${role}` });
//         }

//         // Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             return res.status(400).json({ success: false, error: "Invalid email format" });
//         }

//         // Check if user exists
//         try {
//             const existingUser = await User.findOne({ email });
//             if (existingUser) {
//                 return res.status(409).json({ success: false, error: "Email already registered" });
//             }
//         } catch (dbCheckErr) {
//             console.error("DB check error:", dbCheckErr);
//             return res.status(500).json({ success: false, error: "Database error during email check" });
//         }

//         // Validate DOB
//         const dobDate = new Date(dob);
//         if (isNaN(dobDate.getTime())) {
//             return res.status(400).json({ success: false, error: "Invalid date of birth" });
//         }

//         // Hash password safely
//         let hashedPassword;
//         try {
//             hashedPassword = await bcrypt.hash(password, 10);
//         } catch (hashErr) {
//             console.error("Password hashing error:", hashErr);
//             return res.status(500).json({ success: false, error: "Error processing password" });
//         }

//         // Create user
//         const newUser = new User({ firstName, lastName, gender, email, password: hashedPassword, dob: dobDate, role });
//         try {
//             await newUser.save();
//         } catch (saveErr) {
//             console.error("User save error:", saveErr);
//             if (saveErr.name === "ValidationError") {
//                 const messages = Object.values(saveErr.errors).map(e => e.message);
//                 return res.status(400).json({ success: false, error: messages.join(", ") });
//             }
//             if (saveErr.code === 11000 && saveErr.keyPattern.email) {
//                 return res.status(409).json({ success: false, error: "Email already registered" });
//             }
//             return res.status(500).json({ success: false, error: "Error saving user to database" });
//         }

//         res.status(201).json({ success: true, message: "User registered successfully!" });

//     } catch (err) {
//         console.error("Unexpected register error:", err);
//         res.status(500).json({ success: false, error: "Unexpected server error" });
//     }
// });

// module.exports = router;


// module.exports = router;
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Input validation and sanitization functions
const sanitizeName = (name) => {
    return name.trim().replace(/\s+/g, ' ').replace(/[^a-zA-Z\s]/g, '');
};

const isStrongPassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongRegex.test(password);
};

const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

router.get("/", (req, res) => {
    res.send("User route is working!");
});

// Register route
router.post("/register", async (req, res) => {
    try {
        let { firstName, lastName, gender, email, password, dob, role } = req.body;

        // Validate required fields
        const missingFields = [];
        ["firstName", "lastName", "gender", "email", "password", "dob", "role"].forEach(field => {
            if (!req.body[field] || req.body[field].toString().trim() === "") {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        // Sanitize and validate names
        firstName = sanitizeName(firstName.toString().trim());
        lastName = sanitizeName(lastName.toString().trim());

        if (firstName.length < 2 || firstName.length > 50) {
            return res.status(400).json({
                success: false,
                error: "First name must be between 2 and 50 characters"
            });
        }

        if (lastName.length < 2 || lastName.length > 50) {
            return res.status(400).json({
                success: false,
                error: "Last name must be between 2 and 50 characters"
            });
        }

        // Normalize and validate gender
        gender = gender.toString().trim();
        gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

        if (!["Male", "Female", "Other"].includes(gender)) {
            return res.status(400).json({
                success: false,
                error: `Invalid gender: ${gender}. Must be Male, Female, or Other`
            });
        }

        // Normalize and validate email
        email = email.toString().toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }

        // Validate password strength
        password = password.toString().trim();
        if (!isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
            });
        }

        // Normalize and validate role
        role = role.toString().toLowerCase().trim();
        if (!["doctor", "patient"].includes(role)) {
            return res.status(400).json({
                success: false,
                error: `Invalid role: ${role}. Must be doctor or patient`
            });
        }

        // Validate date of birth
        const dobDate = new Date(dob);
        if (isNaN(dobDate.getTime())) {
            return res.status(400).json({
                success: false,
                error: "Invalid date of birth"
            });
        }

        // Validate age (must be at least 13 years old)
        const age = calculateAge(dobDate);
        if (age < 13) {
            return res.status(400).json({
                success: false,
                error: "You must be at least 13 years old to register"
            });
        }

        // Check if user already exists
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: "Email already registered"
                });
            }
        } catch (dbCheckErr) {
            console.error("DB check error:", dbCheckErr);
            return res.status(500).json({
                success: false,
                error: "Database error during email check"
            });
        }

        // Hash password
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (hashErr) {
            console.error("Password hashing error:", hashErr);
            return res.status(500).json({
                success: false,
                error: "Error processing password"
            });
        }

        // Create and save user
        const newUser = new User({
            firstName,
            lastName,
            gender,
            email,
            password: hashedPassword,
            dob: dobDate,
            role
        });

        try {
            await newUser.save();
            res.status(201).json({
                success: true,
                message: "User registered successfully!",
                user: {
                    id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } catch (saveErr) {
            console.error("User save error:", saveErr);
            if (saveErr.name === "ValidationError") {
                const messages = Object.values(saveErr.errors).map(e => e.message);
                return res.status(400).json({
                    success: false,
                    error: messages.join(", ")
                });
            }
            if (saveErr.code === 11000 && saveErr.keyPattern.email) {
                return res.status(409).json({
                    success: false,
                    error: "Email already registered"
                });
            }
            return res.status(500).json({
                success: false,
                error: "Error saving user to database"
            });
        }

    } catch (err) {
        console.error("Unexpected register error:", err);
        res.status(500).json({
            success: false,
            error: "Unexpected server error"
        });
    }
});

// Remove the duplicate module.exports
module.exports = router;