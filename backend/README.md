# HRMS Backend API

Production-ready backend for the HRMS system built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Admin/Employee)
- ✅ RESTful API architecture
- ✅ PostgreSQL database with proper schema
- ✅ Input validation using Zod
- ✅ Centralized error handling
- ✅ Request logging with Winston
- ✅ Rate limiting
- ✅ Security middleware (Helmet, CORS)

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE hrms_db;
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials and JWT secrets.

4. **Initialize database:**
   The database tables are automatically created on first server start. To seed sample data:
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### Auth
- `POST /auth/login` - Login
- `POST /auth/signup` - Signup
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

#### Employees
- `GET /employees/profile` - Get own profile (authenticated)
- `PUT /employees/profile` - Update own profile (authenticated)
- `GET /employees` - Get all employees (admin only)

#### Attendance
- `POST /attendance/check-in` - Check in (authenticated)
- `POST /attendance/check-out` - Check out (authenticated)
- `GET /attendance/today` - Get today's attendance (authenticated)
- `GET /attendance/history` - Get attendance history (authenticated)
- `GET /attendance/weekly` - Get weekly attendance (authenticated)

#### Leave
- `POST /leave` - Create leave request (authenticated)
- `GET /leave` - Get leave requests (authenticated)
- `PATCH /leave/:id/status` - Update leave status (admin only)

#### Payroll
- `GET /payroll` - Get payroll records (authenticated)
- `POST /payroll` - Create payroll record (admin only)
- `PATCH /payroll/:id/status` - Update payroll status (admin only)

#### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics (authenticated)

## Database Schema

### Tables

1. **users** - User accounts
   - id, employee_id, email, password_hash, role, status

2. **employee_profiles** - Employee details
   - id, user_id, first_name, last_name, phone, address, department, position, date_of_joining, salary

3. **attendance** - Attendance records
   - id, user_id, date, check_in, check_out, status, work_hours

4. **leave_requests** - Leave requests
   - id, user_id, type, start_date, end_date, reason, status, admin_comment

5. **payroll** - Payroll records
   - id, user_id, month, year, basic_salary, allowances, deductions, net_salary, status

## Default Credentials

After seeding:
- **Admin:** admin@dayflow.com / admin123
- **Employee:** john.smith@dayflow.com / employee123

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── services/      # Business logic
│   ├── models/         # Data models (if using ORM)
│   ├── middleware/    # Express middleware
│   ├── utils/          # Utility functions
│   ├── validators/     # Input validation schemas
│   ├── database/       # Database connection & migrations
│   └── server.ts       # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- Refresh token rotation
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- CORS configuration
- Input validation
- SQL injection prevention (parameterized queries)

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## License

MIT

