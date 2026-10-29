"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordDemo = exports.changePassword = exports.updateProfile = exports.getMe = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const auditService_1 = require("../services/auditService");
const emailDemoService_1 = require("../services/emailDemoService");
const generateTokens = (user) => {
    const payload = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, {
        expiresIn: '1d',
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
    return { accessToken, refreshToken };
};
const setTokenCookie = (res, token) => {
    res.cookie('planora_access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
const register = async (req, res) => {
    try {
        const { name, email, password, role, organization, bio } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'An account with this email address already exists.',
            });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.User.create({
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
        await (0, auditService_1.logAudit)({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error occurred during registration.',
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
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
        await (0, auditService_1.logAudit)({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error occurred during login.',
        });
    }
};
exports.login = login;
const logout = async (req, res) => {
    res.clearCookie('planora_access_token');
    res.json({
        success: true,
        message: 'Logged out successfully.',
    });
};
exports.logout = logout;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ success: false, message: 'Refresh token is required.' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_REFRESH_SECRET);
        const user = await User_1.User.findById(decoded.userId);
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
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Refresh token expired or invalid.' });
    }
};
exports.refreshToken = refreshToken;
const getMe = async (req, res) => {
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
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated.' });
            return;
        }
        const updates = req.body;
        const allowed = ['name', 'bio', 'avatar', 'organization', 'website', 'socialLinks', 'phone', 'city'];
        allowed.forEach((field) => {
            if (updates[field] !== undefined) {
                req.user[field] = updates[field];
            }
        });
        await req.user.save();
        await (0, auditService_1.logAudit)({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating profile.' });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated.' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Incorrect current password.' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
        await user.save();
        res.json({ success: true, message: 'Password changed successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error changing password.' });
    }
};
exports.changePassword = changePassword;
const forgotPasswordDemo = async (req, res) => {
    const { email } = req.body;
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (user) {
        await (0, emailDemoService_1.sendDemoEmail)({
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
exports.forgotPasswordDemo = forgotPasswordDemo;
