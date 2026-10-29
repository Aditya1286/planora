import { z } from 'zod';

const sessionSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, 'Session title is required'),
  description: z.string().optional().default(''),
  track: z.string().optional().default('Main Stage'),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  speakerNames: z.array(z.string()).optional().default([]),
  location: z.string().optional().default(''),
});

const speakerSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Speaker name is required'),
  role: z.string().optional().default(''),
  company: z.string().optional().default(''),
  bio: z.string().optional().default(''),
  photo: z.string().optional().default(''),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

const sponsorSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Sponsor name is required'),
  tier: z.enum(['Platinum', 'Gold', 'Silver', 'Community']).default('Gold'),
  logo: z.string().optional().default(''),
  website: z.string().optional().default(''),
});

const ticketTypeInputSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Ticket name is required'),
  description: z.string().optional().default(''),
  price: z.number().min(0, 'Price must be >= 0'),
  totalQuantity: z.number().min(1, 'Quantity must be at least 1'),
  perUserLimit: z.number().min(1).default(5),
  salesStart: z.string().or(z.date()).optional(),
  salesEnd: z.string().or(z.date()).optional(),
  status: z.enum(['active', 'sold_out', 'hidden']).default('active'),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    shortDescription: z.string().optional().default(''),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    categoryId: z.string().min(1, 'Category is required'),
    venueId: z.string().optional().nullable(),
    format: z.enum(['in-person', 'online', 'hybrid']),
    onlineUrl: z.string().optional().default(''),
    coverImage: z.string().min(1, 'Cover image is required'),
    galleryImages: z.array(z.string()).optional().default([]),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    timezone: z.string().optional().default('UTC'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    visibility: z.enum(['public', 'private']).default('public'),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('published'),
    tags: z.array(z.string()).optional().default([]),
    featured: z.boolean().optional().default(false),
    sessions: z.array(sessionSchema).optional().default([]),
    speakers: z.array(speakerSchema).optional().default([]),
    sponsors: z.array(sponsorSchema).optional().default([]),
    ticketTypes: z.array(ticketTypeInputSchema).min(1, 'At least one ticket type is required'),
  }),
});

export const updateEventSchema = z.object({
  body: createEventSchema.shape.body.partial().extend({
    cancellationReason: z.string().optional(),
  }),
});
