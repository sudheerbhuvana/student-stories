import express from 'express';
import Newsletter from '../models/Newsletter.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        // Check if already subscribed
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            if (!existing.isActive) {
                // Reactivate subscription
                existing.isActive = true;
                await existing.save();
                logger.info('Newsletter', `Reactivated subscription for ${email}`);
                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! You have been resubscribed to our newsletter.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'You are already subscribed to our newsletter'
            });
        }

        // Create new subscription
        await Newsletter.create({ email });
        logger.info('Newsletter', `New subscription: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to our newsletter!'
        });
    } catch (error) {
        logger.error('Newsletter', 'Subscription error', error);
        res.status(500).json({
            success: false,
            message: 'Server error while subscribing'
        });
    }
});

export default router;
