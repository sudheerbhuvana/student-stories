import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username'],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [20, 'Username cannot be more than 20 characters'],
            match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
        },
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            trim: true
        },
        role: {
            type: String,
            enum: ['student', 'faculty', 'admin'],
            default: 'student'
        },
        department: {
            type: String,
            required: [true, 'Please provide a department']
        },
        isVerified: {
            type: Boolean,
            default: true // Students are auto-verified, Faculty set to false in controller
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false
        },
        college: {
            type: String,
            trim: true,
            default: 'Koneru Lakshmaiah Education Foundation (KLEF)'
        },
        major: {
            type: String,
            trim: true
        },
        year: {
            type: Number,
            min: 1,
            max: 6
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot be more than 500 characters']
        },
        avatar: {
            type: String
        },
        linkedin: {
            type: String,
            trim: true
        },
        github: {
            type: String,
            trim: true
        },
        portfolio: {
            type: String,
            trim: true
        },
        twitter: {
            type: String,
            trim: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            type: String,
            select: false
        },
        otpExpires: {
            type: Date,
            select: false
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        followRequests: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        isSuspended: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
