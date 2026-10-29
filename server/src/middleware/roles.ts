import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to perform this action. Required role: ${roles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};
