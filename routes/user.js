
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post("/register", async (req, res) => {
    try {
        let { firstName, lastName, gender, email, password, dob, role } = req.body;

        // Normalize gender and role
        if (gender) {
            gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase(); // 'male' → 'Male'
        }
        if (role) {
            role = role.toLowerCase(); // 'Doctor' → 'doctor'
        }

        // Basic validation
        if (!firstName || !lastName || !email || !password || !gender || !dob || !role) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        if (!['Male', 'Female', 'Other'].includes(gender)) {
            return res.status(400).json({ success: false, error: "Invalid gender" });
        }

        if (!['doctor', 'patient'].includes(role)) {
            return res.status(400).json({ success: false, error: "Invalid role" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save user
        const newUser = new User({ firstName, lastName, gender, email, password: hashedPassword, dob, role });
        await newUser.save();

        res.json({ success: true, message: "User registered successfully!" });

    } catch (err) {
        console.error("Register error:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: err.message });
        }
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(400).json({ success: false, error: "Email already registered" });
        }
        res.status(500).json({ success: false, error: "Server error while registering user" });
    }
});

module.exports = router;
