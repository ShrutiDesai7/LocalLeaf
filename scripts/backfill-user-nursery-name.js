const dotenv = require('dotenv');

dotenv.config();

const db = require('../models/db');

async function main() {
  const [dbRows] = await db.query('SELECT DATABASE() AS db');
  const currentDb = dbRows?.[0]?.db || process.env.DB_NAME || '(unknown)';

  const [before] = await db.query(
    `SELECT COUNT(*) AS count
     FROM users
     WHERE role = 'owner' AND (nursery_name IS NULL OR nursery_name = '')`
  );

  const [result] = await db.query(
    `UPDATE users u
     JOIN nurseries n ON n.owner_user_id = u.id
     SET u.nursery_name = n.name
     WHERE u.role = 'owner' AND (u.nursery_name IS NULL OR u.nursery_name = '')`
  );

  const [after] = await db.query(
    `SELECT COUNT(*) AS count
     FROM users
     WHERE role = 'owner' AND (nursery_name IS NULL OR nursery_name = '')`
  );

  console.log(`Connected DB: ${currentDb}`);
  console.log(`Owners missing nursery_name (before): ${before?.[0]?.count ?? 0}`);
  console.log(`Rows updated: ${result?.affectedRows ?? 0}`);
  console.log(`Owners missing nursery_name (after): ${after?.[0]?.count ?? 0}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Backfill failed:', error.code || error.message);
    process.exit(1);
  });

