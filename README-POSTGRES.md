# PostgreSQL Database Setup for Loan Application System

This document explains how to set up the PostgreSQL database for the loan application system.

## Prerequisites

- PostgreSQL installed and running on localhost:5432
- Node.js and npm installed
- Admin access to create databases

## Setup Instructions

### 1. Install Dependencies

```bash
npm install pg @types/pg
```

### 2. Create Database

Connect to PostgreSQL as the postgres user and create the database:

```sql
-- Connect to psql
psql -U postgres

-- Create database
CREATE DATABASE loan_app_db;

-- Create user (optional, for security)
CREATE USER loan_app_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE loan_app_db TO loan_app_user;
```

### 3. Run Database Setup Script

```bash
psql -U postgres -d loan_app_db -f database-setup.sql
```

Or run the SQL commands manually in your PostgreSQL client.

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/loan_app_db"

# Or if you created a specific user:
# DATABASE_URL="postgresql://loan_app_user:your_secure_password@localhost:5432/loan_app_db"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# API Configuration
API_BASE_URL="http://localhost:3000/api"
```

### 5. Start the Application

```bash
npm run dev
```

The application will automatically initialize the database tables on first run.

## Database Schema

### loan_applications Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key, unique application ID |
| first_name | VARCHAR(255) | Applicant's first name |
| last_name | VARCHAR(255) | Applicant's last name |
| email | VARCHAR(255) | Applicant's email |
| phone | VARCHAR(255) | Applicant's phone number |
| date_of_birth | DATE | Applicant's date of birth |
| ssn | VARCHAR(255) | Social Security Number (encrypted) |
| address | TEXT | Street address |
| city | VARCHAR(255) | City |
| state | VARCHAR(255) | State |
| zip_code | VARCHAR(255) | ZIP code |
| employment_status | VARCHAR(255) | Employment status |
| employer_name | VARCHAR(255) | Employer name |
| job_title | VARCHAR(255) | Job title |
| years_employed | VARCHAR(255) | Years at current job |
| annual_income | VARCHAR(255) | Annual income |
| monthly_expenses | VARCHAR(255) | Monthly expenses |
| existing_debts | VARCHAR(255) | Existing debts |
| loan_amount | VARCHAR(255) | Requested loan amount |
| loan_purpose | VARCHAR(255) | Loan purpose |
| loan_term | VARCHAR(255) | Loan term in months |
| documents | TEXT[] | Array of document names |
| accept_terms | BOOLEAN | Terms acceptance |
| accept_privacy | BOOLEAN | Privacy policy acceptance |
| ai_risk_score | INTEGER | AI-calculated risk score (0-100) |
| status | VARCHAR(255) | Application status |
| flags | TEXT[] | Risk flags array |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## API Endpoints

### Loan Applications

- `GET /api/loan-applications` - Get all applications
- `POST /api/loan-applications` - Create new application
- `GET /api/loan-applications/[id]` - Get specific application
- `PUT /api/loan-applications/[id]` - Update application
- `DELETE /api/loan-applications/[id]` - Delete application
- `PUT /api/loan-applications/[id]/status` - Update application status

## Features

### AI Risk Assessment

The system automatically calculates risk scores based on:
- Income-to-loan ratio
- Employment stability
- Debt-to-income ratio
- Employment status

### Risk Flags

Applications are automatically flagged with:
- Risk level (high_risk, medium_risk, low_risk)
- Specific risk indicators (high_loan_to_income, unstable_employment, self_employed)

### Status Management

Applications can have the following statuses:
- `pending` - Initial submission
- `under_review` - Being reviewed by staff
- `approved` - Approved for funding
- `rejected` - Application denied
- `needs_more_info` - Additional information required

## Security Considerations

- SSN and sensitive data should be encrypted at rest
- Use environment variables for database credentials
- Implement proper database user permissions
- Consider using connection pooling for production
- Enable SSL for database connections in production

## Troubleshooting

### Connection Issues

1. Verify PostgreSQL is running: `pg_isready`
2. Check database exists: `\l` in psql
3. Verify connection string in `.env.local`
4. Check firewall settings for port 5432

### Table Creation Issues

1. Run the setup script manually
2. Check for syntax errors in SQL
3. Verify user has CREATE TABLE permissions

### Performance Issues

1. Ensure indexes are created (see setup script)
2. Monitor slow queries with `EXPLAIN ANALYZE`
3. Consider connection pooling for high traffic
