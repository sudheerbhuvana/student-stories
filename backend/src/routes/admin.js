import express from 'express';
import User from '../models/User.js';
import Story from '../models/Story.js';
import Blacklist from '../models/Blacklist.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalStories = await Story.countDocuments({});

        // Count users active (updated) in the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const activeToday = await User.countDocuments({ updatedAt: { $gte: yesterday } });

        res.json({
            success: true,
            data: {
                users: totalUsers,
                stories: totalStories,
                activeToday: activeToday
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/admin/faculty/pending
// @desc    Get all pending faculty requests
// @access  Admin
router.get('/faculty/pending', protect, adminOnly, async (req, res) => {
    try {
        const pendingFaculty = await User.find({ role: 'faculty', isVerified: false })
            .select('-password -otp -otpExpires');

        res.json({
            success: true,
            count: pendingFaculty.length,
            data: pendingFaculty
        });
    } catch (error) {
        console.error('Error fetching pending faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/admin/faculty/verify/:id
// @desc    Approve a faculty account
// @access  Admin
router.put('/faculty/verify/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role !== 'faculty') {
            return res.status(400).json({ success: false, message: 'User is not a faculty member' });
        }

        user.isVerified = true;
        await user.save();

        res.json({
            success: true,
            message: `Faculty member ${user.name} verified successfully`,
            data: user
        });
    } catch (error) {
        console.error('Error verifying faculty:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password -otp -otpExpires')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/admin/blacklist
// @desc    Get all blacklisted words
// @access  Admin
router.get('/blacklist', protect, adminOnly, async (req, res) => {
    try {
        const blacklist = await Blacklist.find({}).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: blacklist.length,
            data: blacklist
        });
    } catch (error) {
        console.error('Error fetching blacklist:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/admin/blacklist
// @desc    Add word to blacklist
// @access  Admin
router.post('/blacklist', protect, adminOnly, async (req, res) => {
    try {
        const { word } = req.body;

        if (!word) {
            return res.status(400).json({ success: false, message: 'Please provide a word' });
        }

        const exists = await Blacklist.findOne({ word: word.toLowerCase() });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Word already blacklisted' });
        }

        const newBlacklist = await Blacklist.create({
            word: word.toLowerCase(),
            addedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: newBlacklist
        });
    } catch (error) {
        console.error('Error adding to blacklist:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/blacklist/:id
// @desc    Remove word from blacklist
// @access  Admin
router.delete('/blacklist/:id', protect, adminOnly, async (req, res) => {
    try {
        const item = await Blacklist.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        await item.deleteOne();

        res.json({
            success: true,
            message: 'Word removed from blacklist'
        });
    } catch (error) {
        console.error('Error removing from blacklist:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update any user details
// @access  Admin
router.put('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const {
            name, email, role, department, bio, college, major, year,
            username, linkedin, github, portfolio, twitter,
            isSuspended, isEmailVerified
        } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department) user.department = department;
        if (bio) user.bio = bio;
        if (college) user.college = college;
        if (major) user.major = major;
        if (year) user.year = year;
        if (username) user.username = username;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (github !== undefined) user.github = github;
        if (portfolio !== undefined) user.portfolio = portfolio;
        if (twitter !== undefined) user.twitter = twitter;
        if (isSuspended !== undefined) user.isSuspended = isSuspended;
        if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/admin/users/:id/message
// @desc    Send a message to a user (Admin Override)
// @access  Admin
router.post('/users/:id/message', protect, adminOnly, async (req, res) => {
    try {
        const { content } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Error sending admin message:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/admin/users/:id/follow
// @desc    Follow a user (Admin Override)
// @access  Admin
router.post('/users/:id/follow', protect, adminOnly, async (req, res) => {
    try {
        const userToFollowId = req.params.id;
        const adminId = req.user._id;

        if (userToFollowId === adminId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(userToFollowId);
        const adminUser = await User.findById(adminId);

        if (!userToFollow) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!userToFollow.followers.includes(adminId)) {
            userToFollow.followers.push(adminId);
            await userToFollow.save();
        }

        if (!adminUser.following.includes(userToFollowId)) {
            adminUser.following.push(userToFollowId);
            await adminUser.save();
        }

        res.json({
            success: true,
            message: `You are now following ${userToFollow.name}`
        });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
