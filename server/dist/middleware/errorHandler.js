"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, _next) => {
    console.error('[Error]', err);
    const statusCode = err.statusCode || (res.statusCode !== 200 && res.statusCode !== 201 ? res.statusCode : 500);
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        res.status(409).json({
            success: false,
            message: `A record with this ${field} already exists.`,
        });
        return;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors || {}).map((e) => e.message);
        res.status(400).json({
            success: false,
            message: 'Database schema validation error',
            errors: messages,
        });
        return;
    }
    // CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: `Invalid ID format for: ${err.path}`,
        });
        return;
    }
    res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected internal server error occurred.',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
