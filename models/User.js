const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    role: { type: String, enum: ['doctor', 'patient'], required: true } // ✅ added role
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
await newUser.save();
console.log("✅ New user saved:", newUser);
res.status(201).json({ message: 'User created successfully!' });