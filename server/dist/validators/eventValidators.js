"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
const sessionSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1, 'Session title is required'),
    description: zod_1.z.string().optional().default(''),
    track: zod_1.z.string().optional().default('Main Stage'),
    startTime: zod_1.z.string().or(zod_1.z.date()),
    endTime: zod_1.z.string().or(zod_1.z.date()),
    speakerNames: zod_1.z.array(zod_1.z.string()).optional().default([]),
    location: zod_1.z.string().optional().default(''),
});
const speakerSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, 'Speaker name is required'),
    role: zod_1.z.string().optional().default(''),
    company: zod_1.z.string().optional().default(''),
    bio: zod_1.z.string().optional().default(''),
    photo: zod_1.z.string().optional().default(''),
    socialLinks: zod_1.z
        .object({
        twitter: zod_1.z.string().optional(),
        linkedin: zod_1.z.string().optional(),
        website: zod_1.z.string().optional(),
    })
        .optional(),
});
const sponsorSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, 'Sponsor name is required'),
    tier: zod_1.z.enum(['Platinum', 'Gold', 'Silver', 'Community']).default('Gold'),
    logo: zod_1.z.string().optional().default(''),
    website: zod_1.z.string().optional().default(''),
});
const ticketTypeInputSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, 'Ticket name is required'),
    description: zod_1.z.string().optional().default(''),
    price: zod_1.z.number().min(0, 'Price must be >= 0'),
    totalQuantity: zod_1.z.number().min(1, 'Quantity must be at least 1'),
    perUserLimit: zod_1.z.number().min(1).default(5),
    salesStart: zod_1.z.string().or(zod_1.z.date()).optional(),
    salesEnd: zod_1.z.string().or(zod_1.z.date()).optional(),
    status: zod_1.z.enum(['active', 'sold_out', 'hidden']).default('active'),
});
exports.createEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
        shortDescription: zod_1.z.string().optional().default(''),
        description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
        categoryId: zod_1.z.string().min(1, 'Category is required'),
        venueId: zod_1.z.string().optional().nullable(),
        format: zod_1.z.enum(['in-person', 'online', 'hybrid']),
        onlineUrl: zod_1.z.string().optional().default(''),
        coverImage: zod_1.z.string().min(1, 'Cover image is required'),
        galleryImages: zod_1.z.array(zod_1.z.string()).optional().default([]),
        startDate: zod_1.z.string().or(zod_1.z.date()),
        endDate: zod_1.z.string().or(zod_1.z.date()),
        timezone: zod_1.z.string().optional().default('UTC'),
        capacity: zod_1.z.number().min(1, 'Capacity must be at least 1'),
        visibility: zod_1.z.enum(['public', 'private']).default('public'),
        status: zod_1.z.enum(['draft', 'published', 'cancelled', 'completed']).default('published'),
        tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
        featured: zod_1.z.boolean().optional().default(false),
        sessions: zod_1.z.array(sessionSchema).optional().default([]),
        speakers: zod_1.z.array(speakerSchema).optional().default([]),
        sponsors: zod_1.z.array(sponsorSchema).optional().default([]),
        ticketTypes: zod_1.z.array(ticketTypeInputSchema).min(1, 'At least one ticket type is required'),
    }),
});
exports.updateEventSchema = zod_1.z.object({
    body: exports.createEventSchema.shape.body.partial().extend({
        cancellationReason: zod_1.z.string().optional(),
    }),
});
