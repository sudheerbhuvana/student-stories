import express from 'express';
import { protect } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all notifications for the current user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name username avatar')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        logger.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark a notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Ensure the notification belongs to the user
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        logger.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
