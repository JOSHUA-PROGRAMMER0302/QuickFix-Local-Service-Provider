# QuickFix — Local Service Provider Directory

> **Web Technology IA-3 Capstone Project** | MERN Stack | Role-Based Web Application

---

## 🚀 Overview

**QuickFix** is a full-stack MERN web application that serves as a local service provider directory for Chennai. Users can browse verified plumbers, electricians, carpenters, AC technicians, painters, and home cleaning services. Administrators can manage providers and users with full CRUD operations.

---

## 🎯 Features Mapped to Rubric

| Rubric Requirement | Implementation |
|---|---|
| Role-based access control | `admin` and `user` roles with JWT middleware |
| Home page showing website capabilities | Admin Dashboard → **Role Access Matrix** section |
| Service provider directory | `UserDirectory.jsx` — cards with search, filter, modal |
| Add/Edit/Delete providers | `ProviderOperations.jsx` — admin-only CRUD |
| User management | `UserManagement.jsx` — admin-only CRUD |
| Input validation (client + server) | `express-validator` + Bootstrap `is-invalid` feedback |
| MongoDB persistence | Mongoose models — `User` and `ServiceProvider` |
| JWT Authentication | `authMiddleware.js` — `protect` + `adminOnly` |
| Password strength enforcement | Live checklist on Signup + ChangePassword |
| Demo credentials | "1-Click Demo Credentials" box on Login page |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router v6, Bootstrap 5, Bootstrap Icons |
| Backend | Node.js, Express.js 4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator (server), Custom hooks (client) |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
Webtechnology-IA-3-Project/
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect + adminOnly
│   │   └── validators.js       # express-validator rules
│   ├── models/
│   │   ├── User.js
│   │   └── ServiceProvider.js
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth/*
│   │   ├── providerRoutes.js   # /api/providers/*
│   │   └── userRoutes.js       # /api/users/*
│   ├── .env
│   ├── package.json
│   ├── seed.js
│   └── server.js
└── frontend/
    └── src/
        ├── api/axiosInstance.js
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── context/AuthContext.jsx
        └── pages/
            ├── Login.jsx
            ├── Signup.jsx
            ├── ChangePassword.jsx
            ├── AdminDashboard.jsx
            ├── ProviderOperations.jsx
            ├── UserManagement.jsx
            └── UserDirectory.jsx
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **MongoDB** running locally on port 27017

### 1. Clone / Open the project
```bash
cd Webtechnology-IA-3-Project
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed       # seeds DB with demo data
npm run dev        # starts API on http://localhost:5000
```

### 3. Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev        # starts Vite on http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@servicedir.com | Admin@123 |
| **Normal User** | rahul@example.com | User@123 |
| **Normal User** | priya@example.com | User@123 |

> 💡 Use the **"1-Click Demo Credentials"** buttons on the Login page for instant autofill!

---

## 🌐 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new account |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Any user | Get logged-in user profile |
| PUT | `/change-password` | Any user | Change own password |

### Providers (`/api/providers`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Any user | List all with filters |
| GET | `/:id` | Any user | Single provider |
| POST | `/` | Admin only | Create provider |
| PUT | `/:id` | Admin only | Update provider |
| DELETE | `/:id` | Admin only | Delete provider |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin only | Dashboard KPIs |
| GET | `/` | Admin only | List users |
| POST | `/` | Admin only | Create user |
| PUT | `/:id` | Admin only | Update user |
| DELETE | `/:id` | Admin only | Delete user |

---

## ✅ Validation Rules

| Field | Rule |
|---|---|
| Email | Valid RFC format |
| Password | 8+ chars, uppercase, lowercase, number, special char |
| Phone | Exactly 10 digits (`^[0-9]{10}$`) |
| experienceYears | Non-negative number |
| visitCharge | Non-negative number |
| Category | Enum: `['Plumber', 'Electrician', ...]` |

---

## 📊 Seeded Data

- **1 Admin** — admin@servicedir.com
- **2 Normal Users** — rahul@example.com, priya@example.com
- **12 Service Providers** across 7 categories and 12 Chennai areas

---

*Built for Web Technology IA-3 Capstone Project — MERN Stack*
