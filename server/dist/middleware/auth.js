"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.planora_access_token) {
            token = req.cookies.planora_access_token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please sign in to continue.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        const user = await User_1.User.findById(decoded.userId).select('-passwordHash');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User belonging to this token no longer exists.',
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
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token. Please sign in again.',
        });
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.planora_access_token) {
            token = req.cookies.planora_access_token;
        }
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
            const user = await User_1.User.findById(decoded.userId).select('-passwordHash');
            if (user && user.status === 'active') {
                req.user = user;
            }
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
