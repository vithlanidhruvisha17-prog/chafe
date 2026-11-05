const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`ARABISTA server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully closing ARABISTA server...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
