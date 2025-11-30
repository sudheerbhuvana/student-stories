import express from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Follow a user (Send Request)
router.post('/follow/:id', protect, async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        if (currentUser.following.includes(req.params.id)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        // Check if request already sent
        if (userToFollow.followRequests.includes(req.user.id)) {
            return res.status(400).json({ message: 'Follow request already sent' });
        }

        // Add to follow requests
        userToFollow.followRequests.push(req.user.id);
        await userToFollow.save();

        // Create Notification
        await Notification.create({
            recipient: userToFollow._id,
            sender: currentUser._id,
            type: 'follow_request'
        });

        logger.info('Social', `Follow request sent from ${currentUser.username} to ${userToFollow.username}`);
        res.status(200).json({ message: 'Follow request sent' });

    } catch (error) {
        logger.error('Social', 'Error following user', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Withdraw follow request
router.post('/withdraw/:id', protect, async (req, res) => {
    try {
        const userToWithdraw = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToWithdraw) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if request exists
        if (!userToWithdraw.followRequests.includes(req.user.id)) {
            return res.status(400).json({ message: 'No pending request to withdraw' });
        }

        // Remove from follow requests
        userToWithdraw.followRequests = userToWithdraw.followRequests.filter(
            id => id.toString() !== req.user.id
        );
        await userToWithdraw.save();

        // Optional: Remove notification if we want to be clean, but simpler to just leave it or let it be.
        // For now, we'll just remove the request.

        logger.info('Social', `Follow request withdrawn from ${currentUser.username} to ${userToWithdraw.username}`);
        res.status(200).json({ message: 'Follow request withdrawn' });

    } catch (error) {
        logger.error('Social', 'Error withdrawing follow request', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept follow request
router.post('/accept/:id', protect, async (req, res) => {
    try {
        const userToAccept = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToAccept) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if request exists
        if (!currentUser.followRequests.includes(req.params.id)) {
            return res.status(400).json({ message: 'No follow request from this user' });
        }

        // 1. Remove from follow requests
        currentUser.followRequests = currentUser.followRequests.filter(
            id => id.toString() !== req.params.id
        );

        // 2. Add to followers (currentUser)
        if (!currentUser.followers.includes(req.params.id)) {
            currentUser.followers.push(req.params.id);
        }

        // 3. Add to following (userToAccept)
        if (!userToAccept.following.includes(req.user.id)) {
            userToAccept.following.push(req.user.id);
        }

        await currentUser.save();
        await userToAccept.save();

        // 4. Update original notification status
        await Notification.findOneAndUpdate(
            { recipient: currentUser._id, sender: req.params.id, type: 'follow_request' },
            { status: 'accepted' }
        );

        // 5. Create new notification for the user who sent the request
        await Notification.create({
            recipient: userToAccept._id,
            sender: currentUser._id,
            type: 'follow_accepted'
        });

        logger.info('Social', `${currentUser.username} accepted follow request from ${userToAccept.username}`);
        res.status(200).json({ message: 'Follow request accepted' });

    } catch (error) {
        logger.error('Social', 'Error accepting follow request', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject follow request
router.post('/reject/:id', protect, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        // Remove from requests
        currentUser.followRequests = currentUser.followRequests.filter(
            id => id.toString() !== req.params.id
        );

        await currentUser.save();

        // Update original notification status
        await Notification.findOneAndUpdate(
            { recipient: currentUser._id, sender: req.params.id, type: 'follow_request' },
            { status: 'rejected' }
        );

        res.status(200).json({ message: 'Follow request rejected' });

    } catch (error) {
        logger.error('Social', 'Error rejecting follow request', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Unfollow user
router.post('/unfollow/:id', protect, async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove from following/followers
        currentUser.following = currentUser.following.filter(
            id => id.toString() !== req.params.id
        );
        userToUnfollow.followers = userToUnfollow.followers.filter(
            id => id.toString() !== req.user.id
        );

        await currentUser.save();
        await userToUnfollow.save();

        logger.info('Social', `${currentUser.username} unfollowed ${userToUnfollow.username}`);
        res.status(200).json({ message: 'Unfollowed successfully' });

    } catch (error) {
        logger.error('Social', 'Error unfollowing user', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get followers
router.get('/followers/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'name username avatar');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.followers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get following
router.get('/following/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'name username avatar');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.following);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending requests
router.get('/requests', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('followRequests', 'name username avatar');
        res.json(user.followRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
