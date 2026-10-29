import app from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(ENV.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Planora API Server running in ${ENV.NODE_ENV} mode`);
      console.log(`📡 URL: http://localhost:${ENV.PORT}`);
      console.log(`🩺 Health: http://localhost:${ENV.PORT}/api/health`);
      console.log(`💻 Client URL: ${ENV.CLIENT_URL}`);
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
  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
};

startServer();
