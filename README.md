# TripLink - User Management & Authentication System

## 📋 Overview

Complete authentication system with user management, JWT-based security, and admin dashboard. This application provides a foundation for a travel-related platform with user authentication and management capabilities.

## ✅ Features Implemented

- ✅ User Registration (3-step form with validation)
- ✅ User Login (JWT authentication with rate limiting)
- ✅ Admin Dashboard with user management
- ✅ Profile Management
- ✅ Account Management
- ✅ Session Management for regular users
- ✅ Admin-specific optimizations (reduced session overhead)

### Note on Security
- Email verification is currently disabled for development
- Token blacklisting is implemented for regular users only
- Admin users have simplified authentication without session tracking

## 🚀 Quick Setup

### Prerequisites

- PHP 8.2+
- MySQL/MariaDB
- Composer
- Node.js & npm

### 1. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure environment variables
# Copy .env.example to .env and update:
# - DATABASE_URL
# - FRONTEND_URL
# - MAILER_FROM
# - MAILER_FROM_NAME
# - JWT_PASSPHRASE

# Run migrations
php bin/console doctrine:migrations:migrate

# Start server
php -S localhost:8000 -t public
```

### 2. Frontend Setup

```bash
cd front-end

# Install dependencies
npm install

# Start development server
npm start
```

## 📝 Environment Variables

Create a `.env` file in the `backend` directory with:

```env
# Database
DATABASE_URL="mysql://root:password@127.0.0.1:3306/trip_link?serverVersion=10.4.32-MariaDB&charset=utf8mb4"

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Email Configuration
MAILER_DSN=null://null
MAILER_FROM=noreply@triplink.com
MAILER_FROM_NAME=TripLink

# JWT Configuration
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_jwt_passphrase_here
JWT_TTL=3600

# Application
APP_ENV=dev
APP_SECRET=your_app_secret_here
```

### Mailtrap Configuration (Development)

For email testing, configure Mailtrap:

```env
MAILER_DSN=smtp://username:password@smtp.mailtrap.io:2525?encryption=tls&auth_mode=login
```

## 🏗️ Architecture

### Backend Structure

```
backend/src/
├── Controller/          # API endpoints
│   ├── AuthController.php
│   ├── AdminController.php
│   ├── ProfileController.php
│   ├── AccountController.php
│   └── LogoutController.php
├── Entity/              # Database entities
│   ├── User.php
│   ├── AuthSession.php
│   ├── LoginAttempt.php
│   ├── BlacklistedToken.php
│   ├── UserActivity.php
│   ├── UserProfile.php
│   └── UserPreferences.php
├── Service/             # Business logic
│   ├── AuthService.php
│   ├── EmailService.php
│   └── ValidationService.php
└── Repository/          # Data access layer
```

### Key Components

- **AuthService**: Handles user authentication and session management
- **AdminController**: Manages admin-specific operations and user management
- **LogoutController**: Handles user logout and session cleanup
- **EmailService**: Handles email notifications (currently disabled for verification)
- **ValidationService**: Input validation and sanitization

## 🔐 Security Features

- Password hashing (bcrypt)
- JWT token authentication
- Rate limiting on login attempts
- Token blacklisting on logout (regular users only)
- Session management for regular users
- Admin-specific optimizations (no session tracking)
- Input validation and sanitization
- CORS configuration

### Important Notes
- Email verification is currently disabled for development
- Admin users have simplified authentication without session tracking
- Regular users have full session management and token blacklisting

## 📡 API Endpoints

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout (blacklist token for regular users)
- `POST /api/logout-all` - Logout from all devices
- `POST /api/refresh-token` - Refresh JWT token
- `GET /api/me` - Get current user

### Admin Endpoints

- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/users/{id}` - Get user details (admin only)
- `PUT /api/admin/users/{id}/status` - Update user status (admin only)
- `DELETE /api/admin/users/{id}` - Delete user (admin only)

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Account

- `POST /api/account/delete` - Delete account

## 🗄️ Database Schema

### User Table

- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `first_name`, `last_name` - User names
- `phone` - Phone number
- `is_verified` - Email verification status (currently not enforced)
- `status` - User status (PENDING, ACTIVE, SUSPENDED, DELETED)
- `is_admin` - Boolean flag for admin users
- `created_at`, `updated_at`, `last_login` - Timestamps
- `token_version` - Token invalidation version (for regular users)
- `travel_styles`, `interests` - User preferences (JSON)
- `profile_image` - Profile picture filename

### Auth Session Table (for regular users only)
- `id` - Primary key
- `user_id` - Foreign key to users
- `session_id` - Unique session identifier
- `jwt_token` - JWT token for the session
- `refresh_token` - Refresh token for the session
- `created_at`, `expires_at` - Session timestamps
- `ip_address` - Client IP address

### Blacklisted Tokens
- `id` - Primary key
- `user_id` - Foreign key to users
- `token` - Blacklisted JWT token
- `blacklisted_at`, `expires_at` - Blacklist timestamps

## 🧪 Testing

### Test Registration

```bash
curl -X POST http://localhost:8000/api/register \
  -F "email=test@example.com" \
  -F "password=Test1234" \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "phone=12345678"
```

### Test Login

```bash
# Regular user login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"User1234"}'

# Admin login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@triplink.com","password":"Admin1234"}'
```

### Admin Endpoints

```bash
# List all users (admin only)
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Update user status (admin only)
curl -X PUT http://localhost:8000/api/admin/users/2/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "SUSPENDED"}'
```

## 🎯 Development Phases

### ✅ Phase 0 — Foundation (Complete)
- Platform scope & positioning
- Permission matrix
- Legal compliance documents
- Agent system foundations
- Code structural support

### ✅ Phase 1 — Core Travel Product (Complete)
- Enhanced destination discovery (multi-tag filtering, advanced sorting)
- Editorial control (featured/pinned destinations)
- Curated collections system
- Public user profiles with contribution summaries
- First-login onboarding flow
- Search autocomplete and tag suggestions

### 📋 Phase 2 — Travel Service & Journey (Next)
- Trip & itinerary management
- Booking flow
- Travel document management
- In-app notifications

**See:** [Documentation](docs/README.md) for complete phase details.

## 📄 License

This project is part of the TripLink application.

---

**Status**: ✅ Phase 1 Complete — Core Travel Product Implemented

**Current Phase:** Phase 1 ✅ Complete → Phase 2 📋 Next
