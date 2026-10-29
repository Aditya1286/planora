"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getCategories = void 0;
const Category_1 = require("../models/Category");
const auditService_1 = require("../services/auditService");
const getCategories = async (_req, res) => {
    try {
        const categories = await Category_1.Category.find().sort({ eventCount: -1, name: 1 });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching categories.' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, description, icon, color, coverImage, isFeatured } = req.body;
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        const category = await Category_1.Category.create({
            name,
            slug,
            description,
            icon: icon || 'Sparkles',
            color: color || '#0047AB',
            coverImage: coverImage || '',
            isFeatured: Boolean(isFeatured),
        });
        await (0, auditService_1.logAudit)({
            userId: req.user?._id,
            userEmail: req.user?.email,
            action: 'CATEGORY_CREATED',
            entityType: 'Category',
            entityId: category._id.toString(),
            req,
        });
        res.status(201).json({ success: true, message: 'Category created.', data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating category.' });
    }
};
exports.createCategory = createCategory;
