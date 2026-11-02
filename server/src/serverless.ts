import { Request, Response } from 'express';
import app from './app';
import { connectDB } from './config/db';

export const handleServerlessRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectDB();
    app(req, res);
  } catch (error) {
    console.error('[Serverless] Request initialization failed:', error);
    res.status(503).json({
      success: false,
      message: 'The service is temporarily unavailable.',
    });
  }
};

export default handleServerlessRequest;
