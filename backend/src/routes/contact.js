import express from 'express';
import Contact from '../models/Contact.js';
import { protect } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact message
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const contact = await Contact.create({
            firstName,
            lastName,
            email,
            message
        });

        logger.info('Contact', `New contact message from ${email}`);
        res.status(201).json({ success: true, message: 'Message sent successfully', data: contact });
    } catch (error) {
        logger.error('Contact', 'Error submitting contact message', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        logger.error('Contact', 'Error fetching contact messages', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/contact/:id/status
// @desc    Update message status
// @access  Private (Admin only)
router.put('/:id/status', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { status } = req.body;
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json({ success: true, data: contact });
    } catch (error) {
        logger.error('Contact', 'Error updating contact message', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        logger.error('Contact', 'Error deleting contact message', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
