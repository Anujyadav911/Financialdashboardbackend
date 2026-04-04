# Finance Dashboard Backend API

A production-ready RESTful backend for a Finance Dashboard system, built with **Node.js**, **Express**, **MongoDB**, and **JWT authentication**. Implements Role-Based Access Control (RBAC), comprehensive financial record management, and rich analytics aggregations.

---

## ⚠️ Important Prerequisite

**Before exploring the API (locally via the Swagger Docs), I highly recommend running the database seeder!**

Open a terminal and run:
```bash
npm run seed
```

**Why is this important?**  
The seeder automatically provisions the database with initial user accounts (Admin, Analyst, Viewer roles) and generates realistic sample financial records. Without running this first, the database will be essentially empty—meaning you won't have the predefined credentials to log in, test access controls, or see any data in the dashboard analytics.

---

## Live Endpoints

**📖 Live API Documentation (Swagger)**
[https://financialdashboardbackend.onrender.com/api/docs](https://financialdashboardbackend.onrender.com/api/docs)

**🌐 Base API URL**
[https://financialdashboardbackend.onrender.com/api/v1](https://financialdashboardbackend.onrender.com/api/v1)

**❤️ Health Check**
[https://financialdashboardbackend.onrender.com/health](https://financialdashboardbackend.onrender.com/health)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Role Permissions](#role-permissions)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Auth Endpoints](#auth-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Financial Records Endpoints](#financial-records-endpoints)
  - [Dashboard / Analytics Endpoints](#dashboard--analytics-endpoints)
- [Validation & Error Handling](#validation--error-handling)
- [Data Models](#data-models)
- [Design Decisions & Tradeoffs](#design-decisions--tradeoffs)

---

## Tech Stack

| Layer          | Technology                         |
|----------------|------------------------------------|
| Runtime        | Node.js v18+                       |
| Framework      | Express.js v4                      |
| Database       | MongoDB + Mongoose v8              |
| Authentication | JSON Web Tokens (JWT)              |
| Validation     | express-validator                  |
| Security       | helmet, cors, express-mongo-sanitize, express-rate-limit |
| Documentation  | swagger-jsdoc, swagger-ui-express |
| Logging        | morgan (dev mode)                  |
| Dev Tools      | nodemon, dotenv                    |

---

## Project Structure

```
finance-dashboard-backend/
├── src/
│   ├── server.js              # Entry point — DB connection + server bootstrap
│   ├── app.js                 # Express app setup — middleware, routes, error handlers
│   │
│   ├── models/
│   │   ├── user.model.js      # User schema (name, email, password, role, isActive)
│   │   └── record.model.js    # FinancialRecord schema (amount, type, category, date)
│   │
│   ├── config/                # Configuration and constants
│   │   └── swagger.js         # Swagger/OpenAPI configurations and documentation
│   │
│   ├── controllers/           # Thin layer — handles HTTP req/res, delegates to services
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── record.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── services/              # Business logic — pure functions, no HTTP concerns
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── record.service.js
│   │   └── dashboard.service.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── record.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js  # protect (JWT), authorize (RBAC), ownerOrAdmin
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── notFound.js         # 404 handler
│   │   └── validate.js         # express-validator runner
│   │
│   ├── validators/
│   │   └── index.js            # All validation chains in one place
│   │
│   └── utils/
│       ├── AppError.js         # Custom operational error class
│       ├── jwt.js              # Token generation and response helpers
│       ├── queryHelpers.js     # Filter, pagination, sort builders
│       └── seeder.js           # Database seeder script
│
├── .env                        # Local environment variables (not committed)
├── .env.example                # Template for environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## Features

### ✅ Core Requirements (All Implemented)
- **User & Role Management** — Create, update, activate/deactivate users; role assignment
- **Financial Records CRUD** — Create, read, update, soft-delete records
- **Filtering** — By type, category, date range, amount range, and keyword search
- **Dashboard Analytics** — Summary totals, category breakdown, monthly/weekly trends, recent activity
- **RBAC Access Control** — Middleware-enforced role permissions across all routes
- **Validation** — express-validator chains on all inputs with structured error responses
- **Error Handling** — Global handler normalizes Mongoose, JWT, and app errors

### ✅ Optional Enhancements (Implemented)
- **Interactive API Docs** — Integrated Swagger/OpenAPI UI for easy testing and documentation
- **JWT Authentication** — Token-based stateless auth with cookie support
- **Pagination** — All list endpoints support `page` and `limit` query params
- **Search** — Description keyword search on records
- **Soft Delete** — Records are never hard-deleted; `isDeleted` flag + `deletedAt` timestamp
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Security Headers** — `helmet`, `mongoSanitize`, `cors` configured
- **Database Seeder** — One-command setup with sample data

---

## Role Permissions

| Action                          | Viewer | Analyst | Admin |
|---------------------------------|--------|---------|-------|
| Register / Login                | ✅     | ✅      | ✅    |
| View own profile                | ✅     | ✅      | ✅    |
| View all users                  | ❌     | ❌      | ✅    |
| Update own profile              | ✅     | ✅      | ✅    |
| Update any user                 | ❌     | ❌      | ✅    |
| Assign roles / activate users   | ❌     | ❌      | ✅    |
| View own records                | ✅     | ✅      | ✅    |
| View all records                | ❌     | ❌      | ✅    |
| Create records                  | ❌     | ✅      | ✅    |
| Update records (own)            | ❌     | ✅      | ✅    |
| Update any record               | ❌     | ❌      | ✅    |
| Delete records (own)            | ❌     | ✅      | ✅    |
| Dashboard summary               | ✅     | ✅      | ✅    |
| Recent activity                 | ✅     | ✅      | ✅    |
| Category breakdown              | ❌     | ✅      | ✅    |
| Monthly/weekly trends           | ❌     | ✅      | ✅    |

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB running locally on `mongodb://localhost:27017` or a MongoDB Atlas URI

### 1. Clone and Install

```bash
cd FinanceDashboardbackend
npm install
```

### 2. Configure Environment

```bash
# The .env file is pre-configured for local development.
# Edit it to point to your MongoDB instance if needed.
```

| Variable              | Default Value                                      | Description                    |
|-----------------------|----------------------------------------------------|--------------------------------|
| `PORT`                | `5000`                                             | HTTP server port               |
| `NODE_ENV`            | `development`                                      | Environment mode               |
| `MONGO_URI`           | `mongodb://localhost:27017/finance_dashboard`      | MongoDB connection string      |
| `JWT_SECRET`          | *(see .env)*                                       | JWT signing secret — **change in production** |
| `JWT_EXPIRES_IN`      | `7d`                                               | JWT token expiry               |
| `RATE_LIMIT_WINDOW_MS`| `900000` (15 min)                                  | Rate limit window              |
| `RATE_LIMIT_MAX`      | `100`                                              | Max requests per window        |

### 3. Seed the Database (Optional but Recommended)

```bash
npm run seed
```

This creates:
- 3 users (admin, analyst, viewer) with 60 financial records each
- **Login credentials printed to terminal after seeding**

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@finance.dev        | Admin@123    |
| Analyst | analyst@finance.dev      | Analyst@123  |
| Viewer  | viewer@finance.dev       | Viewer@123   |

### 4. Start the Server

```bash
# Development (auto-restart on save)
npm run dev

# Production
npm start
```

Server will be available at: `http://localhost:5000`

### 5. Access Interactive API Documentation

```bash
http://localhost:5000/api/docs
```
Open this URL in your browser to view the interactive Swagger UI and test all endpoints.

### 6. Verify Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Finance Dashboard API is running",
  "environment": "development",
  "timestamp": "2024-..."
}
```

---

## API Reference

All API routes are prefixed with `/api/v1`.

> **Authentication**: Include the token in the `Authorization` header:
> `Authorization: Bearer <your_jwt_token>`

---

### Auth Endpoints

#### `POST /api/v1/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password1",
  "role": "viewer"
}
```

> **Note**: The `role` field is optional (defaults to `viewer`). Setting `role: "admin"` requires the requester to be an authenticated admin.

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "<jwt_token>",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "...", "role": "viewer" }
  }
}
```

---

#### `POST /api/v1/auth/login`
Authenticate and receive a JWT.

**Request Body:**
```json
{
  "email": "admin@finance.dev",
  "password": "Admin@123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "token": "<jwt_token>",
  "data": { "user": { ... } }
}
```

---

#### `GET /api/v1/auth/me`
Get the current authenticated user's profile.
**Auth required. Response `200`.**

---

#### `POST /api/v1/auth/logout`
Clears the JWT cookie.
**Auth required. Response `200`.**

---

#### `PATCH /api/v1/auth/change-password`
Change the current user's password.

**Request Body:**
```json
{
  "currentPassword": "OldPass1",
  "newPassword": "NewPass1"
}
```

---

### User Endpoints

#### `GET /api/v1/users`
List all users. **Admin only.**

**Query Params:**

| Param      | Type    | Description                    |
|------------|---------|--------------------------------|
| `role`     | string  | Filter by role                 |
| `isActive` | boolean | Filter by active status        |
| `page`     | integer | Page number (default: 1)       |
| `limit`    | integer | Results per page (default: 20) |

---

#### `GET /api/v1/users/:id`
Get a single user. **Admin or self.**

---

#### `PATCH /api/v1/users/:id`
Update a user. **Admin or self.**

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "email": "new@email.com",
  "role": "analyst",
  "isActive": false
}
```

> `role` and `isActive` can only be changed by admins.

---

#### `PATCH /api/v1/users/:id/deactivate`
Deactivate a user account. **Admin only.**

#### `PATCH /api/v1/users/:id/activate`
Reactivate a user account. **Admin only.**

---

### Financial Records Endpoints

#### `POST /api/v1/records`
Create a new financial record. **Analyst or Admin.**

**Request Body:**
```json
{
  "amount": 5000.00,
  "type": "income",
  "category": "salary",
  "date": "2024-06-01",
  "description": "Monthly salary for June"
}
```

**Valid `type` values:** `income`, `expense`

**Valid `category` values:** `salary`, `freelance`, `investment`, `rental`, `business`, `food`, `transport`, `utilities`, `healthcare`, `education`, `entertainment`, `shopping`, `travel`, `insurance`, `taxes`, `other`

---

#### `GET /api/v1/records`
List records with filters. All roles can access their own; admins can use `userId` to view any user's records.

**Query Params:**

| Param        | Type    | Description                           |
|--------------|---------|---------------------------------------|
| `type`       | string  | `income` or `expense`                 |
| `category`   | string  | One of the supported categories       |
| `startDate`  | date    | ISO 8601 date — from                  |
| `endDate`    | date    | ISO 8601 date — to (inclusive)        |
| `minAmount`  | number  | Minimum amount                        |
| `maxAmount`  | number  | Maximum amount                        |
| `search`     | string  | Keyword in description                |
| `sort`       | string  | `date`, `-date`, `amount`, `-amount`  |
| `page`       | integer | Page number (default: 1)              |
| `limit`      | integer | Results per page (default: 10, max: 100) |
| `userId`     | string  | Admin only — filter by user ID        |

**Example:**
```
GET /api/v1/records?type=expense&category=food&startDate=2024-01-01&endDate=2024-06-30&page=1&limit=20
```

---

#### `GET /api/v1/records/:id`
Get a single record. Non-admins can only access their own.

---

#### `PUT /api/v1/records/:id`
Update a record. **Analyst or Admin** (analysts: own records only).

---

#### `DELETE /api/v1/records/:id`
Soft-delete a record. **Analyst or Admin** (analysts: own records only).

> Records are not physically deleted. `isDeleted` is set to `true` and `deletedAt` is recorded. They are automatically excluded from all future queries.

---

### Dashboard / Analytics Endpoints

#### `GET /api/v1/dashboard/summary`
Get high-level financial summary. **All roles.**

**Query Params:** `startDate`, `endDate`, `userId` (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 25000.00,
    "totalExpenses": 12500.00,
    "netBalance": 12500.00,
    "totalTransactions": 45,
    "incomeCount": 20,
    "expenseCount": 25
  }
}
```

---

#### `GET /api/v1/dashboard/categories`
Category-wise income and expense breakdown. **Analyst and Admin.**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "salary",
      "categoryTotal": 18000.00,
      "breakdown": [
        { "type": "income", "total": 18000.00, "count": 3 }
      ]
    }
  ]
}
```

---

#### `GET /api/v1/dashboard/trends/monthly`
Monthly income vs expense trends. **Analyst and Admin.**
Defaults to the last 12 months if no date range is specified.

**Response:**
```json
{
  "data": [
    {
      "year": 2024,
      "month": 1,
      "label": "2024-01",
      "entries": [
        { "type": "income",  "total": 5000.00, "count": 2 },
        { "type": "expense", "total": 2200.00, "count": 5 }
      ]
    }
  ]
}
```

---

#### `GET /api/v1/dashboard/trends/weekly`
Weekly trends for the current month. **Analyst and Admin.**

---

#### `GET /api/v1/dashboard/recent`
Most recent transactions. **All roles.**

**Query Params:**
| Param   | Type    | Description             |
|---------|---------|-------------------------|
| `limit` | integer | Number of records (max 50, default 10) |

---

## Validation & Error Handling

All endpoints validate input using `express-validator`. On failure, a `422` response is returned with field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```

### HTTP Status Codes Used

| Code | Meaning                              |
|------|--------------------------------------|
| 200  | Success                              |
| 201  | Resource created                     |
| 400  | Bad request (invalid operation)      |
| 401  | Unauthenticated (invalid/missing JWT)|
| 403  | Forbidden (insufficient permissions) |
| 404  | Resource not found                   |
| 409  | Conflict (e.g., duplicate email)     |
| 422  | Validation failed                    |
| 429  | Too many requests (rate limited)     |
| 500  | Internal server error                |

---

## Data Models

### User

| Field            | Type    | Required | Notes                                         |
|------------------|---------|----------|-----------------------------------------------|
| `name`           | String  | ✅       | 2–50 characters                               |
| `email`          | String  | ✅       | Unique, lowercase, valid format               |
| `password`       | String  | ✅       | Hashed with bcrypt (rounds: 12), never returned |
| `role`           | String  | ✅       | `viewer` \| `analyst` \| `admin`; default: `viewer` |
| `isActive`       | Boolean | —        | Default: `true`; set `false` to deactivate   |
| `lastLogin`      | Date    | —        | Updated on each successful login              |
| `createdAt`      | Date    | —        | Auto-managed by Mongoose timestamps           |
| `updatedAt`      | Date    | —        | Auto-managed by Mongoose timestamps           |

### FinancialRecord

| Field         | Type     | Required | Notes                                         |
|---------------|----------|----------|-----------------------------------------------|
| `user`        | ObjectId | ✅       | Reference to User                             |
| `amount`      | Number   | ✅       | Minimum 0.01                                  |
| `type`        | String   | ✅       | `income` \| `expense`                         |
| `category`    | String   | ✅       | One of 16 supported categories                |
| `date`        | Date     | ✅       | Defaults to current date                      |
| `description` | String   | —        | Max 500 characters                            |
| `isDeleted`   | Boolean  | —        | Soft delete flag; default `false`             |
| `deletedAt`   | Date     | —        | Set when soft-deleted                         |
| `createdAt`   | Date     | —        | Auto-managed                                  |
| `updatedAt`   | Date     | —        | Auto-managed                                  |

---

## Design Decisions & Tradeoffs

### Layered Architecture (Controller → Service → Model)
Controllers are kept as thin as possible — they only parse HTTP input and format the response. All business logic lives in the service layer, making it independently testable and reusable.

### Soft Delete
Records are soft-deleted (`isDeleted: true`) rather than hard-deleted. This preserves audit trails and allows data recovery. Records are automatically excluded from all normal queries via a Mongoose pre-find hook.

### Role Enforcement Strategy
Access control is implemented at two levels:
1. **Route level** — `authorize('admin', 'analyst')` guards entire routes
2. **Service level** — Ownership checks (e.g., "can this analyst edit *this* record?") are enforced inside services, not controllers, keeping the logic centralized

### MongoDB Aggregation for Analytics
Dashboard endpoints use MongoDB's native `$aggregate` pipeline instead of loading all records into JavaScript and computing totals. This is significantly more efficient at scale and demonstrates proper backend data processing design.

### JWT in Cookie + Authorization Header
Tokens are issued both as `httpOnly` cookies (for web client security) and as `Authorization` header responses (for API clients and Postman testing). The `protect` middleware reads only the header.

### Password Security
Passwords are hashed with bcrypt at cost factor 12. Passwords are never returned in any query (Mongoose `select: false`). The `comparePassword` instance method uses constant-time comparison.

### Rate Limiting
A sliding window rate limiter (100 req/15min/IP) is applied globally to all `/api` routes to protect against brute-force attacks.

### Assumptions & Tradeoffs
- **No refresh tokens** — For simplicity, only access tokens are implemented. In production, a refresh token rotation pattern would be added.
- **No email verification** — User registration is immediate; email confirmation is out of scope.
- **16 predefined categories** — The category list is enum-constrained to ensure data consistency for analytics grouping.
- **Admin sees all records** — An admin with access to `GET /api/v1/records?userId=<id>` can view any user's records. This is intentional for the finance-admin use case.
