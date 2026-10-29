"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = void 0;
const db_1 = require("../config/db");
const models_1 = require("../models");
const resetDatabase = async () => {
    if (process.env.NODE_ENV === 'production') {
        console.error('⛔ CRITICAL ERROR: Refusing to reset production database!');
        process.exit(1);
    }
    console.log('\n⚠️ RESETTING PLANORA DATABASE (Development only)...');
    await (0, db_1.connectDB)();
    await Promise.all([
        models_1.User.deleteMany({}),
        models_1.Category.deleteMany({}),
        models_1.Venue.deleteMany({}),
        models_1.Event.deleteMany({}),
        models_1.TicketType.deleteMany({}),
        models_1.Booking.deleteMany({}),
        models_1.PromoCode.deleteMany({}),
        models_1.Review.deleteMany({}),
        models_1.Favorite.deleteMany({}),
        models_1.Notification.deleteMany({}),
        models_1.AuditLog.deleteMany({}),
    ]);
    console.log('✅ All collections have been wiped clean.');
    await (0, db_1.disconnectDB)();
};
exports.resetDatabase = resetDatabase;
if (require.main === module) {
    (0, exports.resetDatabase)()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Reset failed:', err);
        process.exit(1);
    });
}
