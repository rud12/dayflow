# HRMS Full-Stack Setup Guide

Complete setup instructions for running the HRMS system with backend and frontend.

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Git**

## Step 1: Database Setup

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**
   ```sql
   CREATE DATABASE hrms_db;
   ```

3. **Note your PostgreSQL credentials:**
   - Host: localhost (default)
   - Port: 5432 (default)
   - Database: hrms_db
   - Username: postgres (default)
   - Password: (your PostgreSQL password)

## Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file:**
   ```env
   PORT=3000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hrms_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   CORS_ORIGIN=http://localhost:8080
   ```

5. **Seed the database (optional but recommended):**
   ```bash
   npm run seed
   ```
   
   This creates sample users and data:
   - Admin: admin@dayflow.com / admin123
   - Employee: john.smith@dayflow.com / employee123

6. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000`
   Database tables are automatically created on first run.

## Step 3: Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional):**
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
   
   If not set, defaults to `http://localhost:3000/api`

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:8080`

## Step 4: Verify Installation

1. **Backend Health Check:**
   Open browser: `http://localhost:3000/health`
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend:**
   Open browser: `http://localhost:8080`
   You should see the login page.

3. **Test Login:**
   - Email: `admin@dayflow.com`
   - Password: `admin123`

## Running in Production

### Backend

1. **Build:**
   ```bash
   cd backend
   npm run build
   ```

2. **Start:**
   ```bash
   npm start
   ```

### Frontend

1. **Build:**
   ```bash
   npm run build
   ```

2. **Preview (or serve with nginx/apache):**
   ```bash
   npm run preview
   ```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l | grep hrms_db`

### Port Already in Use

- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.ts`

### CORS Errors

- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check browser console for specific CORS errors

### Token Issues

- Clear browser localStorage
- Check JWT secrets in `.env` are set
- Verify token expiration settings

## Project Structure

```
all-in-hackathon-hero-main/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── database/       # DB connection & seed
│   │   └── utils/          # Utilities
│   ├── .env                # Environment variables
│   └── package.json
│
├── src/                    # Frontend React app
│   ├── pages/              # Page components
│   ├── components/         # UI components
│   ├── services/           # API service layer
│   ├── contexts/           # React contexts
│   └── types/              # TypeScript types
│
└── package.json
```

## Default Credentials

After seeding:
- **Admin:** admin@dayflow.com / admin123
- **Employee:** john.smith@dayflow.com / employee123

## Next Steps

1. Review `API_DOCUMENTATION.md` for API details
2. Review `backend/README.md` for backend architecture
3. Customize JWT secrets for production
4. Set up proper database backups
5. Configure production environment variables

## Support

For issues or questions:
1. Check the logs in `backend/logs/`
2. Review browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure PostgreSQL is running and accessible

