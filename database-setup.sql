-- PostgreSQL Database Setup for Loan Application System
-- Run this script to create the database and tables

-- Create database (run this as postgres user)
-- CREATE DATABASE loan_app_db;

-- Connect to the database
-- \c loan_app_db;

-- Create the loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  ssn VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  zip_code VARCHAR(255) NOT NULL,
  employment_status VARCHAR(255) NOT NULL,
  employer_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  years_employed VARCHAR(255) NOT NULL,
  annual_income VARCHAR(255) NOT NULL,
  monthly_expenses VARCHAR(255) NOT NULL,
  existing_debts VARCHAR(255) NOT NULL,
  loan_amount VARCHAR(255) NOT NULL,
  loan_purpose VARCHAR(255) NOT NULL,
  loan_term VARCHAR(255) NOT NULL,
  documents TEXT[],
  accept_terms BOOLEAN NOT NULL,
  accept_privacy BOOLEAN NOT NULL,
  ai_risk_score INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  flags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_loan_applications_ai_risk_score ON loan_applications(ai_risk_score);
CREATE INDEX IF NOT EXISTS idx_loan_applications_email ON loan_applications(email);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loan_applications_updated_at 
    BEFORE UPDATE ON loan_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
-- This will be automatically created when the first application is submitted
-- INSERT INTO loan_applications (
--   id, first_name, last_name, email, phone, date_of_birth, ssn, address, city, state, zip_code,
--   employment_status, employer_name, job_title, years_employed, annual_income, monthly_expenses,
--   existing_debts, loan_amount, loan_purpose, loan_term, documents, accept_terms, accept_privacy,
--   ai_risk_score, status, flags
-- ) VALUES (
--   'LA-SAMPLE-001', 'John', 'Doe', 'john@example.com', '(555) 123-4567', '1990-01-01', '123-45-6789',
--   '123 Main St', 'San Francisco', 'CA', '94102', 'full-time', 'Tech Company', 'Software Engineer',
--   '5', '75000', '3500', '15000', '50000', 'debt-consolidation', '36', ARRAY['id.pdf', 'paystub.pdf'],
--   true, true, 45, 'pending', ARRAY['low_risk']
-- );

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
