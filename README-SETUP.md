# Setup Guide for Loan Application System

This guide will help you set up the complete loan application system with separate frontend and backend servers.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step 1: Database Setup

1. **Install PostgreSQL** if not already installed
2. **Create the database:**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   
   -- Create database
   CREATE DATABASE loan_app_db;
   
   -- Create user (optional, for security)
   CREATE USER loan_app_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE loan_app_db TO loan_app_user;
   ```

3. **Run the database setup script:**
   ```bash
   psql -U postgres -d loan_app_db -f database-setup.sql
   ```

## Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Update .env file with your database credentials:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/loan_app_db"
   BACKEND_PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   Backend will be available at: `http://localhost:3001`

## Step 3: Frontend Setup

1. **Navigate to root directory:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Update .env.local file:**
   ```env
   NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

5. **Start the frontend server:**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at: `http://localhost:3000`

## Step 4: Verify Setup

1. **Check backend health:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"OK","timestamp":"..."}`

2. **Check frontend:**
   Open `http://localhost:3000` in your browser

3. **Test loan application:**
   - Fill out the loan application form
   - Submit and check if it appears in the admin dashboard
   - Access admin dashboard at `http://localhost:3000/admin`

## Development Workflow

### Running Both Servers

For development, you'll need both servers running:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### API Endpoints

Backend provides these endpoints at `http://localhost:3001/api`:

- `GET /loan-applications` - List all applications
- `POST /loan-applications` - Create new application
- `GET /loan-applications/:id` - Get specific application
- `PUT /loan-applications/:id` - Update application
- `DELETE /loan-applications/:id` - Delete application
- `PUT /loan-applications/:id/status` - Update status and flags

### Database Schema

The system uses a single `loan_applications` table with comprehensive fields for:
- Personal information
- Employment details
- Financial data
- Document uploads
- AI risk assessment
- Status tracking

## Troubleshooting

### Port Conflicts

If you get port conflicts:
- Change backend port in `backend/.env` (BACKEND_PORT)
- Change frontend port in `next.config.js` or use `npm run dev -- -p 3001`

### Database Connection Issues

1. Verify PostgreSQL is running: `pg_isready`
2. Check database exists: `\l` in psql
3. Verify connection string in `.env`
4. Check firewall settings for port 5432

### CORS Issues

If you get CORS errors:
1. Verify FRONTEND_URL in backend `.env` matches your frontend URL
2. Check that backend server is running
3. Ensure API calls use correct base URL

### Frontend Not Connecting to Backend

1. Check that NEXT_PUBLIC_API_BASE_URL is set correctly
2. Verify backend server is running and accessible
3. Check browser console for specific error messages

## Production Deployment

### Backend Production

1. Set `NODE_ENV=production` in environment
2. Use process manager like PM2
3. Configure reverse proxy (nginx/Apache)
4. Enable SSL/TLS
5. Use connection pooling

### Frontend Production

1. Build with `npm run build`
2. Deploy static files to web server
3. Configure reverse proxy to API server
4. Set proper environment variables

### Database Production

1. Use managed PostgreSQL service
2. Enable backups
3. Configure read replicas for scaling
4. Monitor performance and connections
5. Implement proper security measures

## Features

### AI Risk Assessment

The system automatically calculates risk scores based on:
- Income-to-loan ratio
- Employment stability  
- Debt-to-income ratio
- Employment status

### Admin Dashboard Features

- View and filter applications
- Sort by various criteria
- Detailed application view
- Approve/reject workflow
- Real-time updates

### Form Validation

- Multi-step form with validation
- Required field checking
- Progress tracking
- Document upload support

## Security Considerations

- Use HTTPS in production
- Validate all inputs
- Sanitize database queries
- Implement rate limiting
- Monitor for suspicious activity
- Regular security updates
