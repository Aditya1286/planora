"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        const server = app_1.default.listen(env_1.ENV.PORT, () => {
            console.log(`\n======================================================`);
            console.log(`🚀 Planora API Server running in ${env_1.ENV.NODE_ENV} mode`);
            console.log(`📡 URL: http://localhost:${env_1.ENV.PORT}`);
            console.log(`🩺 Health: http://localhost:${env_1.ENV.PORT}/api/health`);
            console.log(`💻 Client URL: ${env_1.ENV.CLIENT_URL}`);
            console.log(`======================================================\n`);
        });
        const shutdown = () => {
            console.log('\nGracefully shutting down Planora server...');
            server.close(() => {
                console.log('HTTP server closed.');
                process.exit(0);
            });
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    catch (error) {
        console.error('Fatal error during startup:', error);
        process.exit(1);
    }
};
startServer();
