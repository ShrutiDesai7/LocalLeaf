# 🌱 LocalLeaf – Nursery Plant Ordering System

A full-stack web application that connects customers with nearby nurseries to order plants easily.

---

## 🚀 Features

- View available plants
- Request plants from nearby nurseries
- Nursery owners can accept/reject orders
- Simple and clean UI
- Full-stack implementation (Frontend + Backend + Database)

---

## 🛠 Tech Stack

- Frontend: React + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MySQL

---

## Setup & Run

### Clone
git clone https://github.com/ShrutiDesai7/LocalLeaf.git
cd LocalLeaf

### Install backend
npm install

### Setup database
Create DB:
CREATE DATABASE nursery_app;

Run:
schema.sql

### Create .env
DB_HOST=localhost

DB_USER=root

DB_PASSWORD=yourpassword

DB_NAME=nursery_app

PORT=3000

### Run backend
node app.js

### Run frontend
cd frontend

npm install

npm run dev

Frontend: http://localhost:5173  
Backend: http://localhost:3000


### sql queries -
create database nurserydb;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer','owner') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nursery_name VARCHAR(100)
);

CREATE TABLE nurseries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_status ENUM('active','pending','expired') DEFAULT 'pending',
    subscribed_at TIMESTAMP NULL,
    subscription_expires_at TIMESTAMP NULL,
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE TABLE plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    nursery_id INT,
    description TEXT,
    image_urls JSON,
    FOREIGN KEY (nursery_id) REFERENCES nurseries(id)
);


CREATE TABLE plant_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT,
    image_url VARCHAR(255),
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

CREATE TABLE plant_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT,
    user_id INT,
    customer_name VARCHAR(100),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT,
    customer_name VARCHAR(100),
    phone VARCHAR(15),
    address VARCHAR(255),
    status ENUM('pending','accepted','rejected','delivered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_eta VARCHAR(50),
    delivery_partner_name VARCHAR(100),
    delivery_partner_phone VARCHAR(15),
    payment_mode VARCHAR(50),
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

CREATE TABLE nursery_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nursery_id INT,
    doc_type VARCHAR(50),
    original_name VARCHAR(255),
    stored_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nursery_id) REFERENCES nurseries(id)
);


### UI

<img width="1668" height="565" alt="image" src="https://github.com/user-attachments/assets/38eee3f3-ec84-478a-9ebe-3b4ec7495b22" />

<img width="1687" height="747" alt="Screenshot 2026-04-12 183141" src="https://github.com/user-attachments/assets/86656f41-eae4-4d50-8497-b10e190279df" />

<img width="1686" height="839" alt="Screenshot 2026-04-12 183158" src="https://github.com/user-attachments/assets/6ffc7818-6a3f-45d6-b761-b35caac9465c" />

<img width="764" height="732" alt="Screenshot 2026-04-12 183225" src="https://github.com/user-attachments/assets/ec0c4451-0abb-4c00-bcf7-22be1b5ee36a" />

<img width="1695" height="862" alt="image" src="https://github.com/user-attachments/assets/5b65e0b6-f9f7-446f-8fd9-1fcc14728850" />

<img width="1368" height="859" alt="image" src="https://github.com/user-attachments/assets/a224a96e-a887-486f-be73-cf4a7e3d60cb" />


