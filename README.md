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
