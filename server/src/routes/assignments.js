import express from 'express';
import { protect } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get assignments for current user
router.get('/', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.platformRole;
    
    let assignments = [];
    
    if (role === 'TECHNICIAN') {
      // Find technician profile
      const techProfile = await prisma.technicianProfile.findUnique({
        where: { userId }
      });
      
      if (techProfile) {
        assignments = await prisma.assignment.findMany({
          where: { technicianProfileId: techProfile.id },
          include: { job: true }
        });
      }
    } else {
      // For COMPANY_OWNER, get assignments for their organization's jobs
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId },
        select: { organizationId: true }
      });
      
      const orgIds = memberships.map(m => m.organizationId);
      
      assignments = await prisma.assignment.findMany({
        where: {
          job: {
            organizationId: { in: orgIds }
          }
        },
        include: { job: true, technicianProfile: { include: { user: true } } }
      });
    }

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
});

export default router;
