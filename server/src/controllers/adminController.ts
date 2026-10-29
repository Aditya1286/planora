import { Response } from 'express';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, role, status, page = '1', limit = '15' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { organization: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalUsers / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users.' });
  }
};

export const updateUserStatusOrRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Prevent modifying own admin privileges
    if (user._id.toString() === req.user?._id.toString() && (role !== undefined || status === 'suspended')) {
      res.status(400).json({
        success: false,
        message: 'Cannot modify your own administrative role or status.',
      });
      return;
    }

    if (role) user.role = role;
    if (status) user.status = status;
    await user.save();

    await logAudit({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'ADMIN_USER_MODIFIED',
      entityType: 'User',
      entityId: user._id.toString(),
      details: { role, status, targetUser: user.email },
      req,
    });

    res.json({
      success: true,
      message: 'User profile updated by admin.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating user.' });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching audit logs.' });
  }
};
