const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// NOTE: The production app uses MySQL via `models/db.js`.
// This is an optional helper for experimenting with SQLite locally.
const dbPath = path.join(__dirname, '../nursery.db');
const db = new sqlite3.Database(dbPath);

console.log('Creating SQLite tables...');

db.serialize(() => {
  // Users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nursery_name TEXT,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('customer', 'owner')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Nurseries
  db.run(`
    CREATE TABLE IF NOT EXISTS nurseries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      subscription_status TEXT DEFAULT 'pending' CHECK(subscription_status IN ('pending', 'active', 'inactive')),
      subscribed_at TEXT,
      subscription_expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Plants
  db.run(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      description TEXT,
      image_urls TEXT,
      nursery_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Plant Images (optional)
  db.run(`
    CREATE TABLE IF NOT EXISTS plant_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE (plant_id, image_url)
    )
  `);

  // Orders
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Nursery Documents (optional)
  db.run(`
    CREATE TABLE IF NOT EXISTS nursery_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nursery_id INTEGER NOT NULL,
      doc_type TEXT NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      uploaded_at TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log('All SQLite tables created.');
  db.close();
});

