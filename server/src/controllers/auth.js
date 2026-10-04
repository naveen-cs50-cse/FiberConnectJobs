import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { registerSchema, loginSchema } from '../validators/auth.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Set JWT cookie
const setTokenCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, firstName, lastName, role } = validatedData;

    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user within transaction to create appropriate profile/organization based on role
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          platformRole: role,
          settings: {
            create: {}
          }
        },
      });

      if (role === 'TECHNICIAN') {
        await tx.technicianProfile.create({
          data: {
            userId: user.id,
          }
        });
      }
      
      if (role === 'COMPANY_OWNER') {
        const org = await tx.organization.create({
          data: {
            name: `${firstName} ${lastName}'s Company`,
            status: 'VERIFIED',
          }
        });
        
        await tx.organizationMembership.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            role: 'OWNER'
          }
        });
      }
      
      return user;
    });

    const token = generateToken(result.id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        role: result.platformRole,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizationMemberships: {
          include: { organization: true }
        },
        technicianProfile: true,
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken(user.id);
    setTokenCookie(res, token);

    // Record session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.platformRole,
        organizations: user.organizationMemberships,
        technicianProfile: user.technicianProfile,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (token) {
      await prisma.userSession.deleteMany({
        where: { token }
      });
    }

    res.cookie('jwt', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        platformRole: true,
        isVerified: true,
        technicianProfile: true,
        organizationMemberships: {
          include: {
            organization: true
          }
        },
        crewMemberships: {
          include: {
            crew: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
