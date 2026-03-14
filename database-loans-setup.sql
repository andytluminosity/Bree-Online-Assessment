-- PostgreSQL Database Setup for Loans Table
-- Run this script to create loans table after loan_applications table exists

-- Create loans table for approved loan applications
CREATE TABLE IF NOT EXISTS loans (
  id VARCHAR(255) PRIMARY KEY,
  loan_application_id VARCHAR(255) NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  
  -- Loan details (from approved application)
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 4) NOT NULL,
  loan_term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15, 2) NOT NULL,
  
  -- Loan status and dates
  status VARCHAR(255) NOT NULL DEFAULT 'pending_disbursement',
  application_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approval_date TIMESTAMP WITH TIME ZONE,
  disbursement_date TIMESTAMP WITH TIME ZONE,
  first_payment_date TIMESTAMP WITH TIME ZONE,
  maturity_date TIMESTAMP WITH TIME ZONE,
  
  -- Financial calculations
  total_interest DECIMAL(15, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  remaining_balance DECIMAL(15, 2) NOT NULL,
  
  -- Borrower information (copied from application)
  borrower_first_name VARCHAR(255) NOT NULL,
  borrower_last_name VARCHAR(255) NOT NULL,
  borrower_email VARCHAR(255) NOT NULL,
  borrower_phone VARCHAR(255) NOT NULL,
  
  -- Loan officer and processing
  loan_officer_id VARCHAR(255),
  loan_officer_name VARCHAR(255),
  processing_notes TEXT,
  
  -- Payment information
  payment_method VARCHAR(255),
  bank_account_number VARCHAR(255) (encrypted),
  routing_number VARCHAR(255),
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loans_loan_application_id ON loans(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_approval_date ON loans(approval_date);
CREATE INDEX IF NOT EXISTS idx_loans_borrower_email ON loans(borrower_email);
CREATE INDEX IF NOT EXISTS idx_loans_loan_officer_id ON loans(loan_officer_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loans_updated_at 
    BEFORE UPDATE ON loans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_loans_updated_at();

-- Add comments for documentation
COMMENT ON TABLE loans IS 'Table for managing approved and active loans';
COMMENT ON COLUMN loans.loan_application_id IS 'Reference to the original loan application';
COMMENT ON COLUMN loans.principal_amount IS 'Original loan amount borrowed';
COMMENT ON COLUMN loans.interest_rate IS 'Annual interest rate (e.g., 0.0650 for 6.50%)';
COMMENT ON COLUMN loans.monthly_payment IS 'Calculated monthly payment amount';
COMMENT ON COLUMN loans.status IS 'Current loan status (pending_disbursement, active, paid_off, defaulted, etc.)';
COMMENT ON COLUMN loans.total_amount IS 'Total amount including principal and interest';
