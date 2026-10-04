import express from 'express';
import { protect, authorizeRole } from '../middleware/auth.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// @desc    Apply for a job (Technician)
// @route   POST /api/v1/applications
// @access  Private (Technician)
router.post('/', protect, authorizeRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;
    
    // Get technician profile
    const techProfile = await prisma.technicianProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!techProfile) {
      return res.status(400).json({ success: false, message: 'Technician profile not found' });
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        jobId,
        technicianProfileId: techProfile.id
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        technicianProfileId: techProfile.id,
        coverLetter
      }
    });
    
    // Create notification for the organization owner(s)
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        organization: {
          include: {
            memberships: true
          }
        }
      }
    });

    if (job) {
      const notifications = job.organization.memberships.map(m => ({
        userId: m.userId,
        title: 'New Applicant!',
        content: `Someone just applied for "${job.title}". Check your All Applicants tab.`,
        type: 'APPLICATION'
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }
    }

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// @desc    Get my applications (Technician)
// @route   GET /api/v1/applications/me
// @access  Private (Technician)
router.get('/me', protect, authorizeRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const techProfile = await prisma.technicianProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!techProfile) {
      return res.status(404).json({ success: false, message: 'Technician profile not found' });
    }

    const applications = await prisma.application.findMany({
      where: { technicianProfileId: techProfile.id },
      include: {
        job: {
          include: {
            organization: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
});

// @desc    Get applications for my company's jobs
// @route   GET /api/v1/applications
// @access  Private (Company Owner)
router.get('/', protect, authorizeRole('COMPANY_OWNER'), async (req, res, next) => {
  try {
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId: req.user.id },
      select: { organizationId: true }
    });
    
    const orgIds = memberships.map(m => m.organizationId);
    
    const applications = await prisma.application.findMany({
      where: {
        job: {
          organizationId: { in: orgIds }
        }
      },
      include: {
        job: true,
        technicianProfile: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
});

export default router;
