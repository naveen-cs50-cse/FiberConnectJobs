import express from 'express';
import { protect, authorizeRole } from '../middleware/auth.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// @desc    Get all organizations
// @route   GET /api/v1/organizations
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const orgs = await prisma.organization.findMany();
    res.json({ success: true, data: orgs });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new organization
// @route   POST /api/v1/organizations
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, description, industry } = req.body;
    
    const org = await prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name,
          description,
          industry,
          settings: {
            create: {}
          }
        }
      });
      
      // Make creator the owner
      await tx.organizationMembership.create({
        data: {
          userId: req.user.id,
          organizationId: newOrg.id,
          role: 'OWNER'
        }
      });
      
      return newOrg;
    });
    
    res.status(201).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
});

export default router;
