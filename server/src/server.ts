import { createApp } from './app.js';
import { config } from './config/index.js';
import { checkDatabaseConnection, pool } from './database/db.js';

export const app = createApp();

export const server = app.listen(config.port, async () => {
  console.log(`[VOTEXA SERVER] Running on port ${config.port} in ${config.env} mode`);
  console.log(`[VOTEXA SERVER] API Base: http://localhost:${config.port}/api/v1`);
  console.log(`[VOTEXA SERVER] Health Check: http://localhost:${config.port}/health`);

  const dbOk = await checkDatabaseConnection();
  if (dbOk) {
    console.log('[VOTEXA SERVER] PostgreSQL database connection verified.');
  } else {
    console.log('[VOTEXA SERVER] Running in disconnected database mode (configure DATABASE_URL in .env).');
  }
});

export default app;

// Graceful Shutdown
function handleShutdown(signal: string) {
  console.log(`\n[VOTEXA SERVER] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('[VOTEXA SERVER] Database pool closed.');
    } catch (err) {
      console.error('[VOTEXA SERVER] Error closing database pool:', err);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

