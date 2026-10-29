"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectDatabase = void 0;
const db_1 = require("../config/db");
const models_1 = require("../models");
const inspectDatabase = async () => {
    console.log('\n🔍 ================== PLANORA DATABASE INSPECTION ==================');
    await (0, db_1.connectDB)();
    const [usersCount, categoriesCount, venuesCount, eventsCount, ticketsCount, bookingsCount, reviewsCount, promoCodesCount, notificationsCount, auditLogsCount,] = await Promise.all([
        models_1.User.countDocuments(),
        models_1.Category.countDocuments(),
        models_1.Venue.countDocuments(),
        models_1.Event.countDocuments(),
        models_1.TicketType.countDocuments(),
        models_1.Booking.countDocuments(),
        models_1.Review.countDocuments(),
        models_1.PromoCode.countDocuments(),
        models_1.Notification.countDocuments(),
        models_1.AuditLog.countDocuments(),
    ]);
    console.log('\n📊 COLLECTION RECORD COUNTS:');
    console.table({
        Users: { Count: usersCount },
        Categories: { Count: categoriesCount },
        Venues: { Count: venuesCount },
        Events: { Count: eventsCount },
        TicketTypes: { Count: ticketsCount },
        Bookings: { Count: bookingsCount },
        Reviews: { Count: reviewsCount },
        PromoCodes: { Count: promoCodesCount },
        Notifications: { Count: notificationsCount },
        AuditLogs: { Count: auditLogsCount },
    });
    // Role Breakdown
    const roles = await models_1.User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    console.log('👥 USERS BY ROLE:');
    console.table(roles.map((r) => ({ Role: r._id, Count: r.count })));
    // Event Status Breakdown
    const eventStatuses = await models_1.Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    console.log('📅 EVENTS BY STATUS:');
    console.table(eventStatuses.map((s) => ({ Status: s._id, Count: s.count })));
    // Total Gross Revenue from confirmed bookings
    const revenueStat = await models_1.Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, tickets: { $sum: '$quantity' } } },
    ]);
    const gross = revenueStat[0] || { total: 0, tickets: 0 };
    console.log(`💰 Gross Platform Revenue: $${gross.total.toLocaleString()} across ${gross.tickets} confirmed tickets.`);
    // Sample Demo Accounts
    const demoUsers = await models_1.User.find({
        email: { $in: ['admin@planora.dev', 'organizer@planora.dev', 'attendee@planora.dev'] },
    }).select('name email role');
    console.log('\n🔑 VERIFIED DEMO ACCOUNTS:');
    console.table(demoUsers.map((u) => ({ Name: u.name, Email: u.email, Role: u.role })));
    console.log('=====================================================================\n');
    await (0, db_1.disconnectDB)();
};
exports.inspectDatabase = inspectDatabase;
if (require.main === module) {
    (0, exports.inspectDatabase)()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Inspection failed:', err);
        process.exit(1);
    });
}
