import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { ENV } from '../config/env';
import { logAudit } from '../services/auditService';
import { sendDemoEmail } from '../services/emailDemoService';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (user: IUser) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: '1d',
  });

  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

const setTokenCookie = (res: Response, token: string) => {
  res.cookie('planora_access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, organization, bio } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'attendee',
      organization: organization || '',
      bio: bio || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    const { accessToken, refreshToken } = generateTokens(user);
    setTokenCookie(res, accessToken);

    await logAudit({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id.toString(),
      details: { role: user.role },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          organization: user.organization,
          bio: user.bio,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred during registration.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setTokenCookie(res, accessToken);

    await logAudit({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: user._id.toString(),
      req,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          organization: user.organization,
          bio: user.bio,
          phone: user.phone,
          city: user.city,
          socialLinks: user.socialLinks,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred during login.',
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('planora_access_token');
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Refresh token is required.' });
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET) as any;
    const user = await User.findById(decoded.userId);
    if (!user || user.status === 'suspended') {
      res.status(401).json({ success: false, message: 'Invalid refresh token.' });
      return;
    }

    const tokens = generateTokens(user);
    setTokenCookie(res, tokens.accessToken);

    res.json({
      success: true,
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh token expired or invalid.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        bio: req.user.bio,
        organization: req.user.organization,
        website: req.user.website,
        socialLinks: req.user.socialLinks,
        phone: req.user.phone,
        city: req.user.city,
        createdAt: req.user.createdAt,
      },
    },
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const updates = req.body;
    const allowed = ['name', 'bio', 'avatar', 'organization', 'website', 'socialLinks', 'phone', 'city'];
    
    allowed.forEach((field) => {
      if (updates[field] !== undefined) {
        (req.user as any)[field] = updates[field];
      }
    });

    await req.user.save();

    await logAudit({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'User',
      entityId: req.user._id.toString(),
      req,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatar,
          bio: req.user.bio,
          organization: req.user.organization,
          website: req.user.website,
          socialLinks: req.user.socialLinks,
          phone: req.user.phone,
          city: req.user.city,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating profile.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error changing password.' });
  }
};

export const forgotPasswordDemo = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    await sendDemoEmail({
      to: user.email,
      subject: 'Planora — Password Reset Demo Request',
      template: 'password_reset',
      data: {
        name: user.name,
        resetCode: 'PLANORA-7729',
        instructions: 'This is a demo reset link. For demonstration, passwords can also be changed in profile settings.',
      },
    });
  }

  res.json({
    success: true,
    message: 'If an account exists with this email, demo reset instructions have been logged to the server console.',
  });
};
