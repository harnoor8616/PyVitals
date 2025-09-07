const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    role: { type: String, enum: ['doctor', 'patient'], required: true },
    faceData: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
