CREATE DATABASE IF NOT EXISTS nurserydb;
USE nurserydb;

-- NOTE: This file is written to be non-destructive.
-- If you want a fresh reset, drop tables manually before running.

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nursery_name VARCHAR(150) NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'owner') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nurseries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  subscription_status ENUM('pending', 'active', 'inactive') NOT NULL DEFAULT 'pending',
  subscribed_at TIMESTAMP NULL DEFAULT NULL,
  subscription_expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nursery_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nursery_id INT NOT NULL,
  doc_type VARCHAR(100) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  size_bytes INT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nursery_id) REFERENCES nurseries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url VARCHAR(255),
  description TEXT NULL,
  image_urls TEXT NULL,
  nursery_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nursery_id) REFERENCES nurseries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plant_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plant_id INT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plant_id INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- Sample data (optional): create a demo owner + nursery + plants
-- Password for demo owner is "rootroot" (bcrypt hash generated in code at runtime; recommended to register via API instead).
