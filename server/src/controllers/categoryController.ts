import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ eventCount: -1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching categories.' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, icon, color, coverImage, isFeatured } = req.body;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const category = await Category.create({
      name,
      slug,
      description,
      icon: icon || 'Sparkles',
      color: color || '#0047AB',
      coverImage: coverImage || '',
      isFeatured: Boolean(isFeatured),
    });

    await logAudit({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: category._id.toString(),
      req,
    });

    res.status(201).json({ success: true, message: 'Category created.', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating category.' });
  }
};
