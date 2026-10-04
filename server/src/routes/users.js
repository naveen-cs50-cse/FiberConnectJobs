import express from 'express';
import { protect, authorizeRole } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// @desc    Get user details
// @route   GET /api/v1/users/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        platformRole: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        platformRole: true,
        isActive: true,
        createdAt: true,
      }
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

export default router;
