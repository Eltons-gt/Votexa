import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('[MIGRATIONS] Ensuring schema_migrations table exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[MIGRATIONS] No migrations directory found.');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const { rows: appliedRows } = await client.query('SELECT name FROM schema_migrations');
    const appliedSet = new Set(appliedRows.map((r: { name: string }) => r.name));

    for (const file of files) {
      if (!appliedSet.has(file)) {
        console.log(`[MIGRATIONS] Applying migration: ${file}...`);
        const sqlPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`[MIGRATIONS] Successfully applied: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[MIGRATIONS] Error applying migration ${file}:`, err);
          throw err;
        }
      } else {
        console.log(`[MIGRATIONS] Skipping already applied migration: ${file}`);
      }
    }

    console.log('[MIGRATIONS] All migrations are up to date.');
  } finally {
    client.release();
  }
}

// Allow standalone execution: `npm run db:migrate`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => {
      console.log('[MIGRATIONS] Migration process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[MIGRATIONS] Migration failed:', err);
      process.exit(1);
    });
}

