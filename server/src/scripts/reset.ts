import { connectDB, disconnectDB } from '../config/db';
import {
  User,
  Category,
  Venue,
  Event,
  TicketType,
  Booking,
  PromoCode,
  Review,
  Favorite,
  Notification,
  AuditLog,
} from '../models';

export const resetDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ CRITICAL ERROR: Refusing to reset production database!');
    process.exit(1);
  }

  console.log('\n⚠️ RESETTING PLANORA DATABASE (Development only)...');
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Venue.deleteMany({}),
    Event.deleteMany({}),
    TicketType.deleteMany({}),
    Booking.deleteMany({}),
    PromoCode.deleteMany({}),
    Review.deleteMany({}),
    Favorite.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('✅ All collections have been wiped clean.');
  await disconnectDB();
};

if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Reset failed:', err);
      process.exit(1);
    });
}
