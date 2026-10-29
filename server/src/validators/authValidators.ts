import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['attendee', 'organizer']).optional().default('attendee'),
    organization: z.string().optional(),
    bio: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    organization: z.string().optional(),
    website: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    socialLinks: z
      .object({
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
        instagram: z.string().optional(),
      })
      .optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});
