# 🌱 LocalLeaf – Nursery Plant Ordering System

A full-stack web application that connects customers with nearby nurseries to order plants easily. LocalLeaf enables plant enthusiasts to discover and purchase plants from local nurseries while helping nursery owners manage orders and showcase their inventory online.

---

## 📋 Table of Contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup & Run](#setup--run)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

---

## 🚀 Features

- **Browse Plants**: View available plants with details, categories, and images
- **Order Management**: Request plants from nearby nurseries with ease
- **Nursery Dashboard**: Owners can accept/reject orders and manage inventory
- **User Authentication**: Secure login and registration system
- **Plant Reviews**: Customers can review plants they've purchased
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **File Uploads**: Nurseries can upload business documents
- **Real-time Order Tracking**: Track order status updates

---

## Screenshots

### Home Page
<img width="1881" height="658" alt="Screenshot 2026-04-16 131429" src="https://github.com/user-attachments/assets/b3b3e077-8b36-4b53-b1cc-c0bf4f712ac0" />
<img width="1804" height="861" alt="Screenshot 2026-04-16 131501" src="https://github.com/user-attachments/assets/8a5ddc21-2ef4-4cf9-b074-619ed24f2dcd" />
<img width="1516" height="845" alt="image" src="https://github.com/user-attachments/assets/fce84dbb-1ef5-43bf-b0b9-88a3c2274795" />

### Authentication
<img width="1722" height="822" alt="Screenshot 2026-04-16 131524" src="https://github.com/user-attachments/assets/c4078cc4-d08c-499c-9aba-ff563da6fb4f" />

### Plant Review and Ordering
<img width="1550" height="851" alt="Screenshot 2026-04-16 131900" src="https://github.com/user-attachments/assets/2e6ad7dc-d789-413a-8dc9-cf6433d99d0e" />

<img width="626" height="606" alt="Screenshot 2026-04-16 131926" src="https://github.com/user-attachments/assets/d71eb6cf-3505-40cc-abc0-cee6118a5cb0" />

<img width="1472" height="860" alt="image" src="https://github.com/user-attachments/assets/4c0ba494-e0b1-4cf2-9bbf-94a0c6cacd47" />

<img width="1607" height="841" alt="image" src="https://github.com/user-attachments/assets/0cf9c367-9746-4f97-9290-43845acd43bd" />

### Subscription
<img width="1561" height="819" alt="Screenshot 2026-04-16 131700" src="https://github.com/user-attachments/assets/d67614f4-3c9a-46b7-be8d-a90069c8c109" />

---

## �🛠 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MySQL/SQLite
- **Authentication**: JWT tokens
- **File Upload**: FormData API

---

## 📦 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MySQL** (v5.7+) or SQLite
- **Git**

---

## 📁 Project Structure

```
nursery-jfst/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components (Home, Login, Dashboard, etc.)
│   │   ├── api.js        # API client configuration
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── config/               # Backend configuration files
├── controllers/          # Express route controllers
├── models/              # Database models
├── routes/              # API route definitions
├── middleware/          # Express middleware (auth, etc.)
├── migrations/          # Database migration scripts
├── uploads/             # File upload storage
├── app.js              # Main backend entry point
├── package.json
└── schema.sql          # Database schema
```

---

## 🚀 Setup & Run

### Clone Repository
```bash
git clone https://github.com/ShrutiDesai7/LocalLeaf.git
cd nursery-jfst
```

### Backend Setup

#### 1. Install dependencies
```bash
npm install
```

#### 2. Setup database
```bash
# Create database
mysql -u root -p
CREATE DATABASE nursery_app;
```

Then run the schema:
```bash
mysql -u root -p nursery_app < schema.sql
```

#### 3. Create .env file in root directory
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=nursery_app
PORT=3000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

#### 4. Run backend
```bash
node app.js
# or with nodemon for development
npm start
```

Backend will run on: **http://localhost:3000**

### Frontend Setup

#### 1. Navigate to frontend directory
```bash
cd frontend
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Create .env file (if needed)
```env
VITE_API_URL=http://localhost:3000
```

#### 4. Run frontend
```bash
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update user profile

### Plants
- `GET /plants` - Get all plants with filters
- `GET /plants/mine` - Get user's plants (nursery owner)
- `POST /plants` - Create new plant (nursery owner)
- `PATCH /plants/:id` - Update plant (nursery owner)
- `DELETE /plants/:id` - Delete plant (nursery owner)

### Orders
- `GET /orders` - Get all orders (nursery owner)
- `GET /orders/mine` - Get user's orders
- `POST /orders` - Create new order
- `PATCH /orders/:id` - Update order status (nursery owner)

### Reviews
- `GET /plants/:plantId/reviews` - Get plant reviews
- `POST /plants/:plantId/reviews` - Add plant review

### Nursery
- `GET /api/nursery/me` - Get nursery profile
- `PATCH /api/nursery/me` - Update nursery profile
- `POST /api/nursery/subscribe` - Subscribe to premium
- `GET /api/nursery/documents` - Get nursery documents
- `POST /api/nursery/documents` - Upload nursery document
- `DELETE /api/nursery/documents/:id` - Delete nursery document

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | yourpassword |
| `DB_NAME` | Database name | nursery_app |
| `PORT` | Server port | 3000 |
| `JWT_SECRET` | JWT secret key | your_secret_key_here |
| `NODE_ENV` | Environment | development or production |

---

## 🗄️ Database Schema Overview

**Key Tables:**
- `users` - User accounts
- `nurseries` - Nursery profiles
- `plants` - Plant inventory
- `orders` - Customer orders
- `reviews` - Plant reviews
- `nursery_documents` - Uploaded documents

---

## 🐛 Troubleshooting

### Issue: MySQL connection error
**Solution:** 
- Check MySQL is running: `mysql -u root -p`
- Verify .env credentials match your MySQL setup
- Ensure database is created: `CREATE DATABASE nursery_app;`

### Issue: Frontend cannot connect to backend
**Solution:**
- Verify backend is running on port 3000
- Check CORS settings in app.js
- Verify `VITE_API_URL` in frontend .env

### Issue: Port already in use
**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Module not found errors
**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 👨‍💻 Author

**Shruti Desai**
- GitHub: [@ShrutiDesai7](https://github.com/ShrutiDesai7)

---

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ for plant lovers**
