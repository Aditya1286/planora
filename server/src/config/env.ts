import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/planora',
  JWT_SECRET: process.env.JWT_SECRET || 'planora_super_secret_jwt_access_key_2026_dev',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'planora_super_secret_jwt_refresh_key_2026_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DEMO_PAYMENT_MODE: process.env.DEMO_PAYMENT_MODE === 'true',
  DEMO_EMAIL_LOG: process.env.DEMO_EMAIL_LOG === 'true',
};
