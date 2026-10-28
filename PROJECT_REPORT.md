# PROJECT REPORT — IA-3 Capstone Project

## Web Technology | MERN Stack Full-Stack Application

---

## 1. Project Title
**QuickFix — Local Service Provider Directory**  
*Find Plumbers, Electricians, and Local Services in Chennai*

---

## 2. Project Objective

Design and develop a role-based, full-stack MERN web application that allows:
- **Normal Users** to search and view a curated directory of verified local service providers.
- **Administrators** to manage (add, edit, delete) service providers and manage all user accounts.

The application demonstrates mastery of the MERN (MongoDB, Express.js, React.js, Node.js) technology stack with proper authentication, authorization, input validation, and responsive design.

---

## 3. Technology Stack

| Component | Technology | Version |
|---|---|---|
| Frontend Framework | React.js (Vite) | 18.x |
| Frontend Routing | React Router DOM | v6 |
| UI Library | Bootstrap 5 | 5.x |
| Icons | Bootstrap Icons | 1.x |
| HTTP Client | Axios | Latest |
| Backend Framework | Express.js | 4.x |
| Database | MongoDB (local) | Latest |
| ODM | Mongoose | 8.x |
| Authentication | JSON Web Tokens (JWT) | 9.x |
| Password Hashing | bcryptjs | 2.x |
| Input Validation | express-validator | 7.x |
| Dev Server | Nodemon | 3.x |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                      │
│  React 18 + Vite + Bootstrap 5 + React Router v6        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Login   │ │  Signup  │ │  Admin   │ │  User    │   │
│  │  Page    │ │  Page    │ │Dashboard │ │Directory │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│         ↕ Axios (Bearer JWT in headers)                  │
└─────────────────────────────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS.JS REST API (Port 5000)             │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ /api/auth/* │ │/api/providers│ │  /api/users/*    │  │
│  └─────────────┘ └──────────────┘ └──────────────────┘  │
│  Middleware: cors, express.json, protect, adminOnly      │
│  Validation: express-validator rules                     │
└─────────────────────────────────────────────────────────┘
                          │ Mongoose
                          ▼
┌─────────────────────────────────────────────────────────┐
│              MONGODB (Port 27017)                        │
│  Database: local_service_directory                       │
│  Collections: users, serviceproviders                    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Mongoose Schema Definitions

### 5.1 User Schema (`models/User.js`)

| Field | Type | Constraints |
|---|---|---|
| `name` | String | required, trim |
| `email` | String | required, unique, lowercase, trim |
| `password` | String | required, hashed via bcryptjs pre-save hook |
| `phone` | String | required, match `/^[0-9]{10}$/` |
| `role` | String | enum: `['user', 'admin']`, default: `'user'` |
| `status` | String | enum: `['active', 'inactive']`, default: `'active'` |
| `createdAt` | Date | auto (timestamps: true) |
| `updatedAt` | Date | auto (timestamps: true) |

### 5.2 ServiceProvider Schema (`models/ServiceProvider.js`)

| Field | Type | Constraints |
|---|---|---|
| `name` | String | required, trim |
| `category` | String | required, enum: 7 categories |
| `email` | String | required, lowercase |
| `phone` | String | required, match `/^[0-9]{10}$/` |
| `area` | String | required |
| `city` | String | default: `'Chennai'` |
| `experienceYears` | Number | min: 0 |
| `visitCharge` | Number | min: 0 |
| `availability` | Boolean | default: `true` |
| `verified` | Boolean | default: `true` |
| `rating` | Number | min: 1, max: 5, default: 4.5 |
| `skills` | [String] | Array of skills |
| `description` | String | required |
| `createdAt` | Date | auto |
| `updatedAt` | Date | auto |

---

## 6. Authentication & Authorization

### JWT Flow
1. User logs in via `POST /api/auth/login`
2. Server validates credentials, returns signed JWT (expires in 7 days)
3. Client stores token in `localStorage` (`qf_token`)
4. Every subsequent request attaches `Authorization: Bearer <token>` via Axios interceptor
5. Server `protect` middleware verifies and decodes token, attaches `req.user`
6. `adminOnly` middleware checks `req.user.role === 'admin'`

### Middleware Chain
```
Request → CORS → JSON Parser → Route → protect → adminOnly → Controller
```

---

## 7. Server-Side Validation Rules Table

| Rule | Field | Validation |
|---|---|---|
| Email format | `email` | `isEmail()` + `normalizeEmail()` |
| Password min length | `password` | `isLength({ min: 8 })` |
| Password uppercase | `password` | `.matches(/[A-Z]/)` |
| Password lowercase | `password` | `.matches(/[a-z]/)` |
| Password number | `password` | `.matches(/[0-9]/)` |
| Password special char | `password` | `.matches(/[!@#$%^&*...]/)` |
| Phone format | `phone` | `.matches(/^[0-9]{10}$/)` |
| Non-negative experience | `experienceYears` | `.isFloat({ min: 0 })` |
| Non-negative charge | `visitCharge` | `.isFloat({ min: 0 })` |
| Category enum | `category` | `.isIn([...7 categories])` |
| Role enum | `role` | `.isIn(['user', 'admin'])` |
| Status enum | `status` | `.isIn(['active', 'inactive'])` |

---

## 8. API Route Summary

### Auth Routes (`/api/auth`)
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login + receive JWT |
| GET | `/me` | Protected | Get own profile |
| PUT | `/change-password` | Protected | Change own password |

### Provider Routes (`/api/providers`)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Protected | List providers (filterable) |
| GET | `/:id` | Protected | Get single provider |
| POST | `/` | Admin Only | Create provider |
| PUT | `/:id` | Admin Only | Update provider |
| DELETE | `/:id` | Admin Only | Delete provider |

### User Routes (`/api/users`)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/stats` | Admin Only | Dashboard KPIs |
| GET | `/` | Admin Only | List users (searchable) |
| POST | `/` | Admin Only | Create user |
| PUT | `/:id` | Admin Only | Update user |
| DELETE | `/:id` | Admin Only | Delete user |

---

## 9. Frontend Pages & Components

| Component | Type | Purpose |
|---|---|---|
| `Login.jsx` | Page | Email/password login + Demo autofill |
| `Signup.jsx` | Page | Register with live password strength |
| `ChangePassword.jsx` | Page | Change password (any logged-in user) |
| `AdminDashboard.jsx` | Page | KPI cards + Role Matrix + Recent data |
| `ProviderOperations.jsx` | Page | Admin CRUD for service providers |
| `UserManagement.jsx` | Page | Admin CRUD for users |
| `UserDirectory.jsx` | Page | User view — filterable provider cards |
| `Navbar.jsx` | Component | Responsive nav with role-aware links |
| `ProtectedRoute.jsx` | Component | Role-based route guard |
| `AuthContext.jsx` | Context | Global auth state + session persistence |
| `axiosInstance.js` | Utility | Axios with JWT interceptor |

---

## 10. Test Cases

### Authentication
| # | Scenario | Input | Expected Result |
|---|---|---|---|
| TC-01 | Valid admin login | admin@servicedir.com / Admin@123 | JWT token + redirect to `/admin/dashboard` |
| TC-02 | Valid user login | rahul@example.com / User@123 | JWT token + redirect to `/user/directory` |
| TC-03 | Wrong password | admin@servicedir.com / wrong | 401 "Invalid email or password" |
| TC-04 | Missing email | (empty) / Admin@123 | Client validation: "Email is required" |
| TC-05 | Weak password signup | user@test.com / abc | Server 422 with structured errors |

### Provider CRUD (Admin)
| # | Scenario | Expected Result |
|---|---|---|
| TC-06 | Add provider with all valid fields | 201 Created, appears in table |
| TC-07 | Add provider with invalid phone | 422 "Phone must be 10 digits" |
| TC-08 | Edit provider availability | Updated to "Busy"/"Available" instantly |
| TC-09 | Delete provider (confirm = yes) | Provider removed from list |
| TC-10 | Normal user visits /admin/providers | Redirected to /user/directory |

### User Management (Admin)
| # | Scenario | Expected Result |
|---|---|---|
| TC-11 | Add user with valid data | User appears in table |
| TC-12 | Change user role to admin | Badge updates to ADMIN |
| TC-13 | Set user status to inactive | Badge shows "inactive"; user can't login |
| TC-14 | Delete own admin account | Delete button disabled (self-delete protection) |
| TC-15 | Delete another user | User removed from list |

### Search & Filter
| # | Scenario | Expected Result |
|---|---|---|
| TC-16 | Search "Murugan" | Shows Murugan Pipe Works |
| TC-17 | Filter by Category: Electrician | Only electricians shown |
| TC-18 | Filter by Area: Adyar | Only Adyar providers |
| TC-19 | Toggle "Available Only" | Only available=true providers shown |
| TC-20 | Combine search + category filter | Intersection of results |

---

## 11. Database Seeded Data Summary

### Users
| Name | Email | Role | Password |
|---|---|---|---|
| Admin User | admin@servicedir.com | admin | Admin@123 |
| Rahul Sharma | rahul@example.com | user | User@123 |
| Priya Nair | priya@example.com | user | User@123 |

### Service Providers (12 total)
| # | Name | Category | Area | Charge |
|---|---|---|---|---|
| 1 | Murugan Pipe Works | Plumber | Anna Nagar | ₹150 |
| 2 | Selvam Plumbing | Plumber | Adyar | ₹120 |
| 3 | Rajan Electricals | Electrician | T. Nagar | ₹200 |
| 4 | Kumar Power Solutions | Electrician | Velachery | ₹180 |
| 5 | Vijay Woodcraft | Carpenter | Porur | ₹250 |
| 6 | Suresh AC Care | AC Technician | OMR | ₹300 |
| 7 | Balu Cool Tech | AC Technician | Tambaram | ₹275 |
| 8 | Felix Appliance Experts | Appliance Repair | Chromepet | ₹199 |
| 9 | Smart Fix Services | Appliance Repair | Guindy | ₹149 |
| 10 | Rainbow Painters | Painter | Nungambakkam | ₹100 |
| 11 | Artistry Home Painters | Painter | Perambur | ₹80 |
| 12 | Sparkle Home Cleaners | House Cleaning | Kilpauk | ₹500 |

---

## 12. Conclusion

QuickFix successfully demonstrates a production-quality full-stack MERN application with:
- Secure JWT-based authentication with role-based access control
- Complete input validation at both client and server layers
- Full CRUD operations for providers and users persisted to MongoDB
- Responsive, accessible UI with dark glassmorphism design
- Clean separation of concerns across models, middleware, routes, and React components

*Web Technology IA-3 Capstone Report*
