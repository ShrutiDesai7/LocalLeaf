const dotenv = require('dotenv');

dotenv.config();

const db = require('../models/db');

async function main() {
  const [dbRows] = await db.query('SELECT DATABASE() AS db');
  const currentDb = dbRows?.[0]?.db;

  const [columns] = await db.query('SHOW COLUMNS FROM users');
  const hasNurseryName = columns.some((c) => c.Field === 'nursery_name');

  const [users] = await db.query(
    'SELECT id, name, role, nursery_name, phone, created_at FROM users ORDER BY id DESC LIMIT 10'
  );

  console.log(`Connected DB: ${currentDb || process.env.DB_NAME || '(unknown)'}`);
  console.log(`users.nursery_name column: ${hasNurseryName ? 'YES' : 'NO'}`);
  console.table(users);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Show users failed:', error.code || error.message);
    process.exit(1);
  });

