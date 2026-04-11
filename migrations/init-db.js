const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// NOTE: The production app uses MySQL via `models/db.js`.
// This is an experimental script to initialize an SQLite DB from `schema.sql`.
// SQLite DB path
const dbPath = path.join(__dirname, 'nursery.db');
const db = new sqlite3.Database(dbPath);

// Read MySQL schema and adapt for SQLite
const schemaSQL = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');

// SQLite adaptations (replace MySQL syntax)
let sqliteSchema = schemaSQL
  .replace(/CREATE DATABASE IF NOT EXISTS nurserydb;[\s\S]*?USE nurserydb;/, '') // Remove MySQL DB create
  .replace(/AUTO_INCREMENT/g, 'AUTOINCREMENT')
  .replace(/INT/g, 'INTEGER')
  .replace(/VARCHAR\(([^)]+)\)/g, 'TEXT')
  .replace(/DECIMAL\(10, 2\)/g, 'REAL')
  .replace(/ENUM\('([^']+)','([^']+)','([^']+)'\)/g, "TEXT CHECK($1 IN ('$1','$2','$3'))")
  .replace(/TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP/g, 'TEXT DEFAULT (datetime(\"now\"))')
  .replace(/TIMESTAMP NULL DEFAULT NULL/g, 'TEXT')
  .replace(/FOREIGN KEY \(([^)]+)\) REFERENCES ([^ ]+) \(([^)]+)\) ON DELETE CASCADE/g, 'FOREIGN KEY ($1) REFERENCES $2($3)')
  .replace(/ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;/g, ';');

console.log('Initializing SQLite DB...');
db.serialize(() => {
  db.exec(sqliteSchema, (err) => {
    if (err) {
      console.error('Schema error:', err.message);
    } else {
      console.log('SQLite DB initialized with schema.');
    }
    db.close();
  });
});

