"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;
