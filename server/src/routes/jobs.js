import express from 'express';
import { protect, authorizeRole } from '../middleware/auth.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// @desc    Get all jobs (Public/Seeker)
// @route   GET /api/v1/jobs
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        organization: {
          select: { name: true, logoUrl: true }
        }
      }
    });
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
});

// @desc    Get jobs for my organization
// @route   GET /api/v1/jobs/me
// @access  Private (Org Member)
router.get('/me', protect, async (req, res, next) => {
  try {
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId: req.user.id },
      select: { organizationId: true }
    });
    const orgIds = memberships.map(m => m.organizationId);

    const jobs = await prisma.job.findMany({
      where: {
        organizationId: { in: orgIds }
      },
      include: {
        organization: {
          select: { name: true, logoUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
});

// @desc    Create job
// @route   POST /api/v1/jobs
// @access  Private (Org Member)
router.post('/', protect, authorizeRole('COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    let { organizationId, title, description, workCategory, location, latitude, longitude, startDate, compensationModel, compensationAmount } = req.body;
    
    // Authorization: check if user belongs to org
    if (!organizationId) {
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId: req.user.id }
      });
      if (memberships.length > 0) {
        organizationId = memberships[0].organizationId;
      } else {
        return res.status(403).json({ success: false, message: 'User does not belong to any organization' });
      }
    } else {
      const membership = await prisma.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId: req.user.id,
            organizationId
          }
        }
      });
      if (!membership) {
        return res.status(403).json({ success: false, message: 'Not authorized for this organization' });
      }
    }

    const job = await prisma.job.create({
      data: {
        organizationId,
        title,
        description,
        workCategory,
        location,
        latitude,
        longitude,
        startDate: new Date(startDate),
        compensationModel,
        compensationAmount,
        status: 'PUBLISHED'
      }
    });
    
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

// Delete a job
router.delete('/:id', protect, authorizeRole('COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const jobId = req.params.id;
    // Find the job to verify organization ownership
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    // Verify user belongs to the job's organization
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: job.organizationId,
        },
      },
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }
    await prisma.job.delete({ where: { id: jobId } });
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
