import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { Loan } from '../../route'

const DATA_FILE = path.join(process.cwd(), 'data', 'loans.json')

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

// POST /api/loans/[id]/disburse
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { disbursementMethod, bankAccountNumber, routingNumber, notes } = body
    
    const loans = await readLoans()
    const loanIndex = loans.findIndex(loan => loan.id === params.id)
    
    if (loanIndex === -1) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }
    
    const loan = loans[loanIndex]
    
    // Check if loan is pending disbursement
    if (loan.status !== 'pending_disbursement') {
      return NextResponse.json({ 
        error: 'Loan is not pending disbursement' 
      }, { status: 400 })
    }
    
    // Calculate first payment date (30 days from disbursement)
    const disbursementDate = new Date()
    const firstPaymentDate = new Date(disbursementDate)
    firstPaymentDate.setDate(firstPaymentDate.getDate() + 30)
    
    // Update loan status
    loans[loanIndex] = {
      ...loan,
      status: 'active',
      disbursementDate: disbursementDate.toISOString(),
      firstPaymentDate: firstPaymentDate.toISOString(),
      paymentMethod: disbursementMethod || 'ACH',
      bankAccountNumber: bankAccountNumber || '****1234',
      routingNumber: routingNumber || '123456789',
      processingNotes: loan.processingNotes + '\n' + (notes || 'Standard ACH disbursement'),
      updatedAt: new Date().toISOString()
    }
    
    await writeLoans(loans)
    
    return NextResponse.json(loans[loanIndex])
  } catch (error) {
    console.error('Failed to disburse loan:', error)
    return NextResponse.json({ error: 'Failed to disburse loan' }, { status: 500 })
  }
}
