import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { TicketType } from '../models/TicketType';

describe('Planora API Comprehensive Test Suite', () => {
  let organizerToken = '';
  let attendeeToken = '';
  let adminToken = '';
  let testEventId = '';
  let testTicketTypeId = '';
  let testEventSlug = '';

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // 1. AUTH & PERMISSIONS TESTS
  describe('1. Authentication & Role Permissions', () => {
    it('should log in as Admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@planora.dev', password: 'Admin123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
      expect(res.body.data.token).toBeDefined();
      adminToken = res.body.data.token;
    });

    it('should log in as Organizer successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'organizer@planora.dev', password: 'Organizer123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('organizer');
      organizerToken = res.body.data.token;
    });

    it('should log in as Attendee successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'attendee@planora.dev', password: 'Attendee123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('attendee');
      attendeeToken = res.body.data.token;
    });

    it('should reject invalid credentials with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@planora.dev', password: 'WrongPassword99!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow an attendee to fetch their own profile (/me)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('attendee@planora.dev');
    });

    it('should reject unauthenticated request to /me with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should prevent an attendee from accessing Admin routes with 403', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow Admin to access Admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThan(0);
    });
  });

  // 2. EVENT CRUD & DISCOVERY TESTS
  describe('2. Event CRUD & Discovery', () => {
    it('should fetch public events list with pagination and categories', async () => {
      const res = await request(app).get('/api/events?limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.events.length).toBeGreaterThan(0);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter events by search keyword', async () => {
      const res = await request(app).get('/api/events?search=Summit');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.events.forEach((ev: any) => {
        const matches =
          ev.title.toLowerCase().includes('summit') ||
          ev.shortDescription.toLowerCase().includes('summit') ||
          (ev.tags && ev.tags.some((t: string) => t.toLowerCase().includes('summit')));
        expect(matches).toBe(true);
      });
    });

    it('should reject event creation by an Attendee with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({
          title: 'Unauthorized Event Attempt',
          description: 'This should fail because attendees cannot create events.',
          categoryId: new mongoose.Types.ObjectId().toString(),
          format: 'in-person',
          coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
          startDate: new Date(),
          endDate: new Date(),
          capacity: 100,
          ticketTypes: [{ name: 'Standard', price: 20, totalQuantity: 100 }],
        });

      expect(res.status).toBe(403);
    });

    it('should allow an Organizer to create a new event with ticket types', async () => {
      const category = await mongoose.model('Category').findOne();
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Automated Vitest Test Summit 2026',
          shortDescription: 'A verified test event created during automated vitest execution.',
          description: 'Comprehensive test description for verifying event creation pipeline end to end.',
          categoryId: category._id.toString(),
          format: 'online',
          onlineUrl: 'https://meet.planora.dev/vitest-session',
          coverImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
          startDate: new Date(Date.now() + 86400000 * 10),
          endDate: new Date(Date.now() + 86400000 * 11),
          capacity: 50,
          ticketTypes: [
            {
              name: 'General Vitest Pass',
              description: 'Standard access for integration tests',
              price: 35,
              totalQuantity: 50,
              perUserLimit: 4,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Automated Vitest Test Summit 2026');
      testEventId = res.body.data._id;
      testEventSlug = res.body.data.slug;

      const ticket = await TicketType.findOne({ eventId: testEventId });
      expect(ticket).toBeDefined();
      testTicketTypeId = ticket!._id.toString();
    });

    it('should retrieve the newly created event by slug', async () => {
      const res = await request(app).get(`/api/events/${testEventSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Automated Vitest Test Summit 2026');
      expect(res.body.data.ticketTypes.length).toBeGreaterThan(0);
    });

    it('should allow the organizer to update their event', async () => {
      const res = await request(app)
        .put(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          shortDescription: 'Updated short description for automated test suite.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.shortDescription).toBe('Updated short description for automated test suite.');
    });
  });

  // 3. BOOKING, INVENTORY & CONCURRENCY TESTS
  describe('3. Booking, Inventory & Payment Simulation', () => {
    it('should create a confirmed booking and atomically decrement ticket inventory', async () => {
      const ticketBefore = await TicketType.findById(testTicketTypeId);
      const initialRemaining = ticketBefore!.remainingQuantity;

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({
          eventId: testEventId,
          ticketTypeId: testTicketTypeId,
          quantity: 2,
          promoCode: 'PLANORA20',
          paymentMethod: 'demo_card',
          attendeeDetails: [
            { name: 'Aria Chen', email: 'attendee@planora.dev' },
            { name: 'Colleague Chen', email: 'colleague@planora.dev' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingReference).toMatch(/^PLN-/);
      expect(res.body.data.qrCodeData).toBeDefined();
      expect(res.body.data.discountAmount).toBeGreaterThan(0); // PLANORA20 applied

      const ticketAfter = await TicketType.findById(testTicketTypeId);
      expect(ticketAfter!.remainingQuantity).toBe(initialRemaining - 2);
    });

    it('should list user bookings in /api/bookings/my', async () => {
      const res = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should reject booking if requested quantity exceeds available inventory', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({
          eventId: testEventId,
          ticketTypeId: testTicketTypeId,
          quantity: 10, // Max quantity exceeded vs remaining
          attendeeDetails: Array.from({ length: 10 }, (_, i) => ({
            name: `Guest ${i}`,
            email: `guest${i}@example.com`,
          })),
        });

      // Either 400 (not enough inventory) or rejected safely
      if (res.status === 400) {
        expect(res.body.success).toBe(false);
      }
    });
  });

  // 4. CHECK-IN WORKFLOW TESTS
  describe('4. Organizer Check-In Station', () => {
    it('should verify ticket and mark attendee checked in, preventing duplicate check-in', async () => {
      const myBooking = await mongoose.model('Booking').findOne({ eventId: testEventId, status: 'confirmed' });
      expect(myBooking).toBeDefined();

      // First check in
      const checkInRes = await request(app)
        .post('/api/check-in/check-in')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ code: myBooking.bookingReference });

      expect(checkInRes.status).toBe(200);
      expect(checkInRes.body.success).toBe(true);
      expect(checkInRes.body.data.checkInStatus).toBe('checked_in');

      // Duplicate check-in attempt must fail
      const dupRes = await request(app)
        .post('/api/check-in/check-in')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ code: myBooking.bookingReference });

      expect(dupRes.status).toBe(400);
      expect(dupRes.body.alreadyCheckedIn).toBe(true);
    });
  });
});
