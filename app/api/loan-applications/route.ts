import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'

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
  documents: string[] // Store file names/paths
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

const DATA_FILE = path.join(process.cwd(), 'data', 'loan-applications.json')

// Initialize data file if it doesn't exist
async function ensureDataFile() {
  try {
    await readFile(DATA_FILE, 'utf8')
  } catch (error) {
    // File doesn't exist, create it with empty array
    const dataDir = path.dirname(DATA_FILE)
    await writeFile(DATA_FILE, '[]', 'utf8')
  }
}

// Read all loan applications
async function readLoanApplications(): Promise<LoanApplication[]> {
  await ensureDataFile()
  try {
    const data = await readFile(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// Write loan applications
async function writeLoanApplications(applications: LoanApplication[]): Promise<void> {
  await ensureDataFile()
  await writeFile(DATA_FILE, JSON.stringify(applications, null, 2), 'utf8')
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
    const applications = await readLoanApplications()
    return NextResponse.json(applications)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch loan applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    // Save to file
    const applications = await readLoanApplications()
    applications.push(newApplication)
    await writeLoanApplications(applications)
    
    return NextResponse.json(newApplication, { status: 201 })
  } catch (error) {
    console.error('Error creating loan application:', error)
    return NextResponse.json({ error: 'Failed to create loan application' }, { status: 500 })
  }
}
