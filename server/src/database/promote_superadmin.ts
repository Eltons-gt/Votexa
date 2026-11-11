import { pool } from './db.js';

export async function promoteUserToSuperAdmin(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  console.log(`[PROMOTION] Looking up user: ${normalizedEmail}`);

  const client = await pool.connect();
  try {
    // 1. Check if user exists in users table
    const userRes = await client.query('SELECT id, email, full_name, system_role FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    
    let userId: string;
    if (userRes.rows.length === 0) {
      console.log(`[PROMOTION] User ${normalizedEmail} not in public.users yet. Creating user record...`);
      const insertUser = await client.query(
        `INSERT INTO users (email, full_name, system_role) 
         VALUES ($1, $2, 'SUPER_ADMIN') 
         RETURNING id, email, full_name, system_role`,
        [normalizedEmail, 'Super Administrator']
      );
      userId = insertUser.rows[0].id;
      console.log(`[PROMOTION] Created user with ID: ${userId}`);
    } else {
      userId = userRes.rows[0].id;
      console.log(`[PROMOTION] Found user ${userId}. Updating system_role to SUPER_ADMIN...`);
      await client.query(`UPDATE users SET system_role = 'SUPER_ADMIN', updated_at = NOW() WHERE id = $1`, [userId]);
    }

    // 2. Insert into platform_roles table
    await client.query(
      `INSERT INTO platform_roles (user_id, role) 
       VALUES ($1, 'SUPER_ADMIN') 
       ON CONFLICT (user_id, role) DO NOTHING`,
      [userId]
    );
    console.log(`[PROMOTION] Granted SUPER_ADMIN platform role to user ${userId}`);

    // 3. Remove any organization memberships (Super Admin does not belong to any single tenant)
    const deleteOrgMembers = await client.query('DELETE FROM organization_members WHERE user_id = $1 RETURNING id', [userId]);
    console.log(`[PROMOTION] Cleared ${deleteOrgMembers.rowCount} organization membership(s) for super admin user ${userId}`);

    // Verify
    const verifyUser = await client.query('SELECT id, email, full_name, system_role FROM users WHERE id = $1', [userId]);
    const verifyRoles = await client.query('SELECT role FROM platform_roles WHERE user_id = $1', [userId]);
    const verifyOrgs = await client.query('SELECT * FROM organization_members WHERE user_id = $1', [userId]);
    
    console.log('[PROMOTION] Success! Current record:', verifyUser.rows[0]);
    console.log('[PROMOTION] Platform roles:', verifyRoles.rows.map(r => r.role));
    console.log('[PROMOTION] Organization memberships count:', verifyOrgs.rows.length);
    
    console.log('[PROMOTION] Success! Current record:', verifyUser.rows[0]);
    console.log('[PROMOTION] Platform roles:', verifyRoles.rows.map(r => r.role));
  } finally {
    client.release();
    await pool.end();
  }
}

// Run for target email if executed directly
const targetEmail = process.argv[2] || 'chunegeorge112@gmail.com';
promoteUserToSuperAdmin(targetEmail).catch(err => {
  console.error('[PROMOTION_ERROR]', err);
  process.exit(1);
});

