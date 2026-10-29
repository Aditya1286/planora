"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Please provide a valid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        role: zod_1.z.enum(['attendee', 'organizer']).optional().default('attendee'),
        organization: zod_1.z.string().optional(),
        bio: zod_1.z.string().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Please enter a valid email'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        bio: zod_1.z.string().optional(),
        avatar: zod_1.z.string().optional(),
        organization: zod_1.z.string().optional(),
        website: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        socialLinks: zod_1.z
            .object({
            twitter: zod_1.z.string().optional(),
            linkedin: zod_1.z.string().optional(),
            github: zod_1.z.string().optional(),
            instagram: zod_1.z.string().optional(),
        })
            .optional(),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
    }),
});
