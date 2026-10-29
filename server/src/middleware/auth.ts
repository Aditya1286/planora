import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.planora_access_token) {
      token = req.cookies.planora_access_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.',
      });
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
};

export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.planora_access_token) {
      token = req.cookies.planora_access_token;
    }

    if (token) {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
};
