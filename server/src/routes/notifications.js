import express from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// @desc    Get all notifications for user
// @route   GET /api/v1/notifications
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20 // Only show recent 20
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark a notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      data: { isRead: true }
    });

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
