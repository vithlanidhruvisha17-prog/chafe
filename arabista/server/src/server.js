const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 5000;

const checkStorageBucket = async () => {
  try {
    const { getSupabase } = require('./config/supabase');
    const supabase = getSupabase();
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'arabista-images';
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn(`[Storage Warning] Unable to list Supabase storage buckets: ${error.message}`);
      return;
    }
    const targetBucket = buckets?.find((b) => b.name === bucketName);
    if (!targetBucket) {
      console.warn(`[Storage Warning] Bucket "${bucketName}" was not found in Supabase project. Please create public bucket "${bucketName}".`);
    } else if (!targetBucket.public) {
      console.warn(`[Storage Warning] Bucket "${bucketName}" exists but is NOT public. Set bucket to public in Supabase dashboard.`);
    } else {
      console.log(`[Storage] Public bucket "${bucketName}" verified.`);
    }
  } catch (err) {
    console.warn(`[Storage Warning] Storage startup check skipped: ${err.message}`);
  }
};

const server = app.listen(PORT, () => {
  console.log(`ARABISTA server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  checkStorageBucket();
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
