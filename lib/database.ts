import { Pool } from 'pg'

// Create a new pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Initialize database tables
export async function initializeDatabase() {
  const createTableQuery = `
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

    CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
    CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at);
    CREATE INDEX IF NOT EXISTS idx_loan_applications_ai_risk_score ON loan_applications(ai_risk_score);
  `

  try {
    await query(createTableQuery)
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Database model interfaces
export interface DatabaseLoanApplication {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  ssn: string
  address: string
  city: string
  state: string
  zip_code: string
  employment_status: string
  employer_name: string
  job_title: string
  years_employed: string
  annual_income: string
  monthly_expenses: string
  existing_debts: string
  loan_amount: string
  loan_purpose: string
  loan_term: string
  documents: string[]
  accept_terms: boolean
  accept_privacy: boolean
  ai_risk_score: number
  status: string
  flags: string[]
  created_at: string
  updated_at: string
}

// Convert database row to API response format
export function dbRowToApplication(row: DatabaseLoanApplication) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    ssn: row.ssn,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    employmentStatus: row.employment_status,
    employerName: row.employer_name,
    jobTitle: row.job_title,
    yearsEmployed: row.years_employed,
    annualIncome: row.annual_income,
    monthlyExpenses: row.monthly_expenses,
    existingDebts: row.existing_debts,
    loanAmount: row.loan_amount,
    loanPurpose: row.loan_purpose,
    loanTerm: row.loan_term,
    documents: row.documents || [],
    acceptTerms: row.accept_terms,
    acceptPrivacy: row.accept_privacy,
    aiRiskScore: row.ai_risk_score,
    status: row.status as 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_more_info',
    flags: row.flags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Convert API request to database format
export function applicationToDbRow(application: any) {
  return {
    id: application.id,
    first_name: application.firstName,
    last_name: application.lastName,
    email: application.email,
    phone: application.phone,
    date_of_birth: application.dateOfBirth,
    ssn: application.ssn,
    address: application.address,
    city: application.city,
    state: application.state,
    zip_code: application.zipCode,
    employment_status: application.employmentStatus,
    employer_name: application.employerName,
    job_title: application.jobTitle,
    years_employed: application.yearsEmployed,
    annual_income: application.annualIncome,
    monthly_expenses: application.monthlyExpenses,
    existing_debts: application.existingDebts,
    loan_amount: application.loanAmount,
    loan_purpose: application.loanPurpose,
    loan_term: application.loanTerm,
    documents: application.documents || [],
    accept_terms: application.acceptTerms,
    accept_privacy: application.acceptPrivacy,
    ai_risk_score: application.aiRiskScore,
    status: application.status,
    flags: application.flags || [],
  }
}
