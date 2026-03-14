import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'loans.json')

export interface Loan {
  id: string
  loanApplicationId: string
  principalAmount: number
  interestRate: number
  loanTermMonths: number
  monthlyPayment: number
  status: string
  applicationDate: string
  approvalDate: string
  disbursementDate: string | null
  firstPaymentDate: string | null
  maturityDate: string
  totalInterest: number
  totalAmount: number
  remainingBalance: number
  borrowerFirstName: string
  borrowerLastName: string
  borrowerEmail: string
  borrowerPhone: string
  loanOfficerId: string
  loanOfficerName: string
  processingNotes: string
  paymentMethod: string | null
  bankAccountNumber: string | null
  routingNumber: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Read all loans
async function readLoans(): Promise<Loan[]> {
  try {
    const data = await readFile(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// Write loans
async function writeLoans(loans: Loan[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(loans, null, 2), 'utf8')
}

// Calculate loan details
function calculateLoanDetails(loanAmount: number, annualRate: number, termMonths: number) {
  const monthlyRate = annualRate / 12
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                      (Math.pow(1 + monthlyRate, termMonths) - 1)
  const totalAmount = monthlyPayment * termMonths
  const totalInterest = totalAmount - loanAmount
  
  // Calculate maturity date (assuming first payment in 30 days)
  const maturityDate = new Date()
  maturityDate.setMonth(maturityDate.getMonth() + termMonths)
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    maturityDate: maturityDate.toISOString(),
  }
}

// GET /api/loans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const loanOfficerId = searchParams.get('loanOfficerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let loans = await readLoans()
    
    // Apply filters
    if (status && status !== 'all') {
      loans = loans.filter(loan => loan.status === status)
    }
    
    if (loanOfficerId && loanOfficerId !== 'all') {
      loans = loans.filter(loan => loan.loanOfficerId === loanOfficerId)
    }
    
    // Sort by creation date (newest first)
    loans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLoans = loans.slice(startIndex, endIndex)
    
    return NextResponse.json({
      loans: paginatedLoans,
      pagination: {
        page,
        limit,
        total: loans.length,
        pages: Math.ceil(loans.length / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch loans:', error)
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 })
  }
}

// POST /api/loans
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      loanApplicationId, 
      loanOfficerId, 
      loanOfficerName, 
      processingNotes,
      createdBy,
      customInterestRate,
      customTermMonths
    } = body
    
    if (!loanApplicationId) {
      return NextResponse.json({ error: 'Loan application ID is required' }, { status: 400 })
    }
    
    // For demo purposes, we'll create a mock loan from the application ID
    // In a real system, you would fetch the actual application data
    const mockApplicationData = {
      principalAmount: 50000,
      borrowerFirstName: 'Demo',
      borrowerLastName: 'User',
      borrowerEmail: 'demo@example.com',
      borrowerPhone: '(555) 000-0000'
    }
    
    // Use custom values or defaults
    const principalAmount = body.principalAmount || mockApplicationData.principalAmount
    const interestRate = customInterestRate ? parseFloat(customInterestRate) : 0.065
    const termMonths = customTermMonths ? parseInt(customTermMonths) : 36
    
    // Calculate loan details
    const loanDetails = calculateLoanDetails(principalAmount, interestRate, termMonths)
    
    // Create new loan
    const newLoan: Loan = {
      id: `LN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      loanApplicationId,
      principalAmount,
      interestRate,
      loanTermMonths: termMonths,
      monthlyPayment: loanDetails.monthlyPayment,
      status: 'pending_disbursement',
      applicationDate: new Date().toISOString(),
      approvalDate: new Date().toISOString(),
      disbursementDate: null,
      firstPaymentDate: null,
      maturityDate: loanDetails.maturityDate,
      totalInterest: loanDetails.totalInterest,
      totalAmount: loanDetails.totalAmount,
      remainingBalance: loanDetails.totalAmount,
      borrowerFirstName: body.borrowerFirstName || mockApplicationData.borrowerFirstName,
      borrowerLastName: body.borrowerLastName || mockApplicationData.borrowerLastName,
      borrowerEmail: body.borrowerEmail || mockApplicationData.borrowerEmail,
      borrowerPhone: body.borrowerPhone || mockApplicationData.borrowerPhone,
      loanOfficerId: loanOfficerId || 'OFFICER-001',
      loanOfficerName: loanOfficerName || 'Default Officer',
      processingNotes: processingNotes || 'Standard processing',
      paymentMethod: null,
      bankAccountNumber: null,
      routingNumber: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: createdBy || 'system',
    }
    
    // Save to file
    const loans = await readLoans()
    loans.push(newLoan)
    await writeLoans(loans)
    
    return NextResponse.json(newLoan, { status: 201 })
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 })
  }
}
