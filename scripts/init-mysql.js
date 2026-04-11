const fs = require('fs');
const path = require('path');

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function main() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true
  });

  try {
    console.log('Initializing MySQL schema from schema.sql...');
    await connection.query(schemaSQL);
    console.log('MySQL schema ready.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('MySQL init failed:', error.code || error.message);
  process.exit(1);
});

