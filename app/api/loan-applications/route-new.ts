import { NextRequest, NextResponse } from 'next/server'
import { query, initializeDatabase, dbRowToApplication, applicationToDbRow } from '@/lib/database'

export interface LoanApplication {
  id: string
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  ssn: string
  address: string
  city: string
  state: string
  zipCode: string
  // Employment Information
  employmentStatus: string
  employerName: string
  jobTitle: string
  yearsEmployed: string
  annualIncome: string
  // Financial Information
  monthlyExpenses: string
  existingDebts: string
  loanAmount: string
  loanPurpose: string
  loanTerm: string
  // Documents
  documents: string[]
  // Terms
  acceptTerms: boolean
  acceptPrivacy: boolean
  // Backend fields
  aiRiskScore: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_more_info'
  flags: string[]
  createdAt: string
  updatedAt: string
}

// Calculate AI risk score (mock implementation)
function calculateRiskScore(application: Omit<LoanApplication, 'id' | 'aiRiskScore' | 'status' | 'flags' | 'createdAt' | 'updatedAt'>): number {
  let score = 50 // Base score
  
  // Income to loan amount ratio
  const income = parseFloat(application.annualIncome) || 0
  const loanAmount = parseFloat(application.loanAmount) || 0
  const ratio = loanAmount / income
  
  if (ratio > 3) score -= 20
  else if (ratio > 2) score -= 10
  else if (ratio < 1) score += 10
  
  // Employment stability
  const yearsEmployed = parseFloat(application.yearsEmployed) || 0
  if (yearsEmployed < 1) score -= 15
  else if (yearsEmployed > 3) score += 10
  
  // Debt to income ratio (mock calculation)
  const monthlyExpenses = parseFloat(application.monthlyExpenses) || 0
  const existingDebts = parseFloat(application.existingDebts) || 0
  const monthlyIncome = income / 12
  const debtRatio = (monthlyExpenses + (existingDebts / 12)) / monthlyIncome
  
  if (debtRatio > 0.5) score -= 25
  else if (debtRatio > 0.3) score -= 10
  else if (debtRatio < 0.2) score += 10
  
  // Employment status
  if (application.employmentStatus === 'self-employed') score -= 5
  else if (application.employmentStatus === 'full-time') score += 5
  
  return Math.max(0, Math.min(100, score))
}

// Generate flags based on risk factors
function generateFlags(application: Omit<LoanApplication, 'id' | 'aiRiskScore' | 'status' | 'flags' | 'createdAt' | 'updatedAt'>, riskScore: number): string[] {
  const flags: string[] = []
  
  if (riskScore < 30) flags.push('high_risk')
  else if (riskScore < 50) flags.push('medium_risk')
  else flags.push('low_risk')
  
  const income = parseFloat(application.annualIncome) || 0
  const loanAmount = parseFloat(application.loanAmount) || 0
  
  if (loanAmount / income > 3) flags.push('high_loan_to_income')
  
  const yearsEmployed = parseFloat(application.yearsEmployed) || 0
  if (yearsEmployed < 1) flags.push('unstable_employment')
  
  if (application.employmentStatus === 'self-employed') flags.push('self_employed')
  
  return flags
}

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()
    
    const result = await query('SELECT * FROM loan_applications ORDER BY created_at DESC')
    const applications = result.rows.map(dbRowToApplication)
    
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Failed to fetch loan applications:', error)
    return NextResponse.json({ error: 'Failed to fetch loan applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'ssn',
      'address', 'city', 'state', 'zipCode', 'employmentStatus',
      'employerName', 'jobTitle', 'yearsEmployed', 'annualIncome',
      'monthlyExpenses', 'existingDebts', 'loanAmount', 'loanPurpose',
      'loanTerm', 'acceptTerms', 'acceptPrivacy'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }
    
    // Calculate risk score and flags
    const riskScore = calculateRiskScore(body)
    const flags = generateFlags(body, riskScore)
    
    // Create new loan application
    const newApplication: LoanApplication = {
      ...body,
      id: `LA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      aiRiskScore: riskScore,
      status: 'pending',
      flags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: body.documents || []
    }
    
    // Convert to database format and save
    const dbRow = applicationToDbRow(newApplication)
    const insertQuery = `
      INSERT INTO loan_applications (
        id, first_name, last_name, email, phone, date_of_birth, ssn, address, city, state, zip_code,
        employment_status, employer_name, job_title, years_employed, annual_income, monthly_expenses,
        existing_debts, loan_amount, loan_purpose, loan_term, documents, accept_terms, accept_privacy,
        ai_risk_score, status, flags, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29
      ) RETURNING *
    `
    
    const values = [
      dbRow.id, dbRow.first_name, dbRow.last_name, dbRow.email, dbRow.phone, dbRow.date_of_birth, dbRow.ssn,
      dbRow.address, dbRow.city, dbRow.state, dbRow.zip_code, dbRow.employment_status, dbRow.employer_name,
      dbRow.job_title, dbRow.years_employed, dbRow.annual_income, dbRow.monthly_expenses, dbRow.existing_debts,
      dbRow.loan_amount, dbRow.loan_purpose, dbRow.loan_term, dbRow.documents, dbRow.accept_terms,
      dbRow.accept_privacy, dbRow.ai_risk_score, dbRow.status, dbRow.flags, newApplication.createdAt,
      newApplication.updatedAt
    ]
    
    const result = await query(insertQuery, values)
    const savedApplication = dbRowToApplication(result.rows[0])
    
    return NextResponse.json(savedApplication, { status: 201 })
  } catch (error) {
    console.error('Error creating loan application:', error)
    return NextResponse.json({ error: 'Failed to create loan application' }, { status: 500 })
  }
}
