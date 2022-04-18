const mongoose = require('mongoose');
const crypto = require('crypto');
const { mongooseConnection }=require('../db/connectDB');

const userSchema = new mongoose.Schema({
    name: {
        id: mongoose.ObjectId,
        type: String,
        trim: true,
        required: true,
        max: 128,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: false,
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    },

}, { timestamps: true })

const User = mongooseConnection.model("User", userSchema);


exports.User = User;
