"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: [env_1.ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Body parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP address, please try again after 15 minutes.',
    },
});
app.use('/api', limiter);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    const dbState = mongoose_1.default.connection.readyState;
    const dbStatusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    res.json({
        success: true,
        platform: 'Planora API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbStatusMap[dbState] || 'unknown',
        demoMode: {
            payments: env_1.ENV.DEMO_PAYMENT_MODE,
            emailLogs: env_1.ENV.DEMO_EMAIL_LOG,
        },
    });
});
// API Routes
app.use('/api', routes_1.default);
// Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
