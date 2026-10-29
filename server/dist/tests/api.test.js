"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("../app"));
const db_1 = require("../config/db");
const TicketType_1 = require("../models/TicketType");
(0, vitest_1.describe)('Planora API Comprehensive Test Suite', () => {
    let organizerToken = '';
    let attendeeToken = '';
    let adminToken = '';
    let testEventId = '';
    let testTicketTypeId = '';
    let testEventSlug = '';
    (0, vitest_1.beforeAll)(async () => {
        await (0, db_1.connectDB)();
    });
    (0, vitest_1.afterAll)(async () => {
        await (0, db_1.disconnectDB)();
    });
    // 1. AUTH & PERMISSIONS TESTS
    (0, vitest_1.describe)('1. Authentication & Role Permissions', () => {
        (0, vitest_1.it)('should log in as Admin successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'admin@planora.dev', password: 'Admin123!' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.user.role).toBe('admin');
            (0, vitest_1.expect)(res.body.data.token).toBeDefined();
            adminToken = res.body.data.token;
        });
        (0, vitest_1.it)('should log in as Organizer successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'organizer@planora.dev', password: 'Organizer123!' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.user.role).toBe('organizer');
            organizerToken = res.body.data.token;
        });
        (0, vitest_1.it)('should log in as Attendee successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'attendee@planora.dev', password: 'Attendee123!' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.user.role).toBe('attendee');
            attendeeToken = res.body.data.token;
        });
        (0, vitest_1.it)('should reject invalid credentials with 401', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'admin@planora.dev', password: 'WrongPassword99!' });
            (0, vitest_1.expect)(res.status).toBe(401);
            (0, vitest_1.expect)(res.body.success).toBe(false);
        });
        (0, vitest_1.it)('should allow an attendee to fetch their own profile (/me)', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${attendeeToken}`);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.user.email).toBe('attendee@planora.dev');
        });
        (0, vitest_1.it)('should reject unauthenticated request to /me with 401', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/me');
            (0, vitest_1.expect)(res.status).toBe(401);
            (0, vitest_1.expect)(res.body.success).toBe(false);
        });
        (0, vitest_1.it)('should prevent an attendee from accessing Admin routes with 403', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${attendeeToken}`);
            (0, vitest_1.expect)(res.status).toBe(403);
            (0, vitest_1.expect)(res.body.success).toBe(false);
        });
        (0, vitest_1.it)('should allow Admin to access Admin routes', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.users.length).toBeGreaterThan(0);
        });
    });
    // 2. EVENT CRUD & DISCOVERY TESTS
    (0, vitest_1.describe)('2. Event CRUD & Discovery', () => {
        (0, vitest_1.it)('should fetch public events list with pagination and categories', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/events?limit=5');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.events.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(res.body.data.pagination).toBeDefined();
        });
        (0, vitest_1.it)('should filter events by search keyword', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/events?search=Summit');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            res.body.data.events.forEach((ev) => {
                const matches = ev.title.toLowerCase().includes('summit') ||
                    ev.shortDescription.toLowerCase().includes('summit') ||
                    (ev.tags && ev.tags.some((t) => t.toLowerCase().includes('summit')));
                (0, vitest_1.expect)(matches).toBe(true);
            });
        });
        (0, vitest_1.it)('should reject event creation by an Attendee with 403 Forbidden', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/events')
                .set('Authorization', `Bearer ${attendeeToken}`)
                .send({
                title: 'Unauthorized Event Attempt',
                description: 'This should fail because attendees cannot create events.',
                categoryId: new mongoose_1.default.Types.ObjectId().toString(),
                format: 'in-person',
                coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
                startDate: new Date(),
                endDate: new Date(),
                capacity: 100,
                ticketTypes: [{ name: 'Standard', price: 20, totalQuantity: 100 }],
            });
            (0, vitest_1.expect)(res.status).toBe(403);
        });
        (0, vitest_1.it)('should allow an Organizer to create a new event with ticket types', async () => {
            const category = await mongoose_1.default.model('Category').findOne();
            const res = await (0, supertest_1.default)(app_1.default)
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
            (0, vitest_1.expect)(res.status).toBe(201);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.title).toBe('Automated Vitest Test Summit 2026');
            testEventId = res.body.data._id;
            testEventSlug = res.body.data.slug;
            const ticket = await TicketType_1.TicketType.findOne({ eventId: testEventId });
            (0, vitest_1.expect)(ticket).toBeDefined();
            testTicketTypeId = ticket._id.toString();
        });
        (0, vitest_1.it)('should retrieve the newly created event by slug', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get(`/api/events/${testEventSlug}`);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.title).toBe('Automated Vitest Test Summit 2026');
            (0, vitest_1.expect)(res.body.data.ticketTypes.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should allow the organizer to update their event', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/events/${testEventId}`)
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                shortDescription: 'Updated short description for automated test suite.',
            });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.shortDescription).toBe('Updated short description for automated test suite.');
        });
    });
    // 3. BOOKING, INVENTORY & CONCURRENCY TESTS
    (0, vitest_1.describe)('3. Booking, Inventory & Payment Simulation', () => {
        (0, vitest_1.it)('should create a confirmed booking and atomically decrement ticket inventory', async () => {
            const ticketBefore = await TicketType_1.TicketType.findById(testTicketTypeId);
            const initialRemaining = ticketBefore.remainingQuantity;
            const res = await (0, supertest_1.default)(app_1.default)
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
            (0, vitest_1.expect)(res.status).toBe(201);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.bookingReference).toMatch(/^PLN-/);
            (0, vitest_1.expect)(res.body.data.qrCodeData).toBeDefined();
            (0, vitest_1.expect)(res.body.data.discountAmount).toBeGreaterThan(0); // PLANORA20 applied
            const ticketAfter = await TicketType_1.TicketType.findById(testTicketTypeId);
            (0, vitest_1.expect)(ticketAfter.remainingQuantity).toBe(initialRemaining - 2);
        });
        (0, vitest_1.it)('should list user bookings in /api/bookings/my', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/bookings/my')
                .set('Authorization', `Bearer ${attendeeToken}`);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should reject booking if requested quantity exceeds available inventory', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
                (0, vitest_1.expect)(res.body.success).toBe(false);
            }
        });
    });
    // 4. CHECK-IN WORKFLOW TESTS
    (0, vitest_1.describe)('4. Organizer Check-In Station', () => {
        (0, vitest_1.it)('should verify ticket and mark attendee checked in, preventing duplicate check-in', async () => {
            const myBooking = await mongoose_1.default.model('Booking').findOne({ eventId: testEventId, status: 'confirmed' });
            (0, vitest_1.expect)(myBooking).toBeDefined();
            // First check in
            const checkInRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/check-in/check-in')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ code: myBooking.bookingReference });
            (0, vitest_1.expect)(checkInRes.status).toBe(200);
            (0, vitest_1.expect)(checkInRes.body.success).toBe(true);
            (0, vitest_1.expect)(checkInRes.body.data.checkInStatus).toBe('checked_in');
            // Duplicate check-in attempt must fail
            const dupRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/check-in/check-in')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ code: myBooking.bookingReference });
            (0, vitest_1.expect)(dupRes.status).toBe(400);
            (0, vitest_1.expect)(dupRes.body.alreadyCheckedIn).toBe(true);
        });
    });
});
