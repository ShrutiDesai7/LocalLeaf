const dotenv = require('dotenv');

dotenv.config();

const db = require('../models/db');

async function main() {
  const [rows] = await db.query(
    `SELECT table_name AS name
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
     ORDER BY table_name`
  );

  console.log(`Connected to DB: ${process.env.DB_NAME || 'nurserydb'}`);
  console.log(`Tables (${rows.length}):`);
  for (const row of rows) {
    console.log(`- ${row.name}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('DB check failed:', error.code || error.message);
    process.exit(1);
  });

