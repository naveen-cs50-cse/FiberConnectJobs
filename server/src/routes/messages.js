import express from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// @desc    Get unread message count
// @route   GET /api/v1/messages/unread
// @access  Private
router.get('/unread', protect, async (req, res, next) => {
  try {
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: { contains: req.user.id },
        senderId: { not: req.user.id },
        isRead: false
      }
    });
    res.status(200).json({ success: true, count: unreadCount });
  } catch (error) {
    next(error);
  }
});

// @desc    Get messages with a specific user
// @route   GET /api/v1/messages/:userId
// @access  Private
router.get('/:userId', protect, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Conversation ID can just be a string combining both IDs deterministically
    const conversationId = [req.user.id, userId].sort().join('_');

    // Mark all unread messages from this sender as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
});

// @desc    Send a message
// @route   POST /api/v1/messages/:userId
// @access  Private
router.post('/:userId', protect, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const conversationId = [req.user.id, userId].sort().join('_');

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: req.user.id,
        content
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'New Message',
        content: `You received a new message from ${message.sender.firstName} ${message.sender.lastName}`,
        type: 'MESSAGE'
      }
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all conversations for the current user
// @route   GET /api/v1/messages
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    // Find all distinct conversationIds the user is part of
    const messages = await prisma.message.findMany({
      where: {
        conversationId: {
          contains: req.user.id
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, platformRole: true }
        }
      }
    });

    // Group by conversation to get the latest message and the "other" user
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      if (!conversationsMap.has(msg.conversationId)) {
        // Find the ID of the *other* person in this conversation
        const participants = msg.conversationId.split('_');
        const otherUserId = participants.find(id => id !== req.user.id);
        
        if (otherUserId) {
          // Fetch the other user's basic info
          const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: { id: true, firstName: true, lastName: true, platformRole: true }
          });
          
          if (otherUser) {
            // Count unread messages in this conversation
            const unreadCount = await prisma.message.count({
              where: {
                conversationId: msg.conversationId,
                senderId: otherUserId,
                isRead: false
              }
            });

            conversationsMap.set(msg.conversationId, {
              id: msg.conversationId,
              otherUser,
              latestMessage: msg,
              unreadCount
            });
          }
        }
      }
    }

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
});

export default router;
