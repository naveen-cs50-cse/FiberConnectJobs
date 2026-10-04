import express from 'express';
import authRoutes from './auth.js';
import organizationRoutes from './organizations.js';
import jobRoutes from './jobs.js';

import userRoutes from './users.js';
import assignmentRoutes from './assignments.js';
import applicationRoutes from './applications.js';
import messageRoutes from './messages.js';
import notificationRoutes from './notifications.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/jobs', jobRoutes);
router.use('/users', userRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/applications', applicationRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

export default router;
