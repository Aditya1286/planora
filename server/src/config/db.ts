import mongoose from 'mongoose';
import { ENV } from './env';

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(ENV.MONGODB_URI)
      .then((conn) => {
        console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
        return conn;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error('[MongoDB] Connection error:', error);
        throw error;
      });
  }

  await connectionPromise;
};

export const disconnectDB = async (): Promise<void> => {
  connectionPromise = null;
  await mongoose.disconnect();
};
