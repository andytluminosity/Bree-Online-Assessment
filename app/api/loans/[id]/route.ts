import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { Loan } from '../route'

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

// GET /api/loans/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loans = await readLoans()
    const loan = loans.find(loan => loan.id === params.id)
    
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }
    
    return NextResponse.json(loan)
  } catch (error) {
    console.error('Failed to fetch loan:', error)
    return NextResponse.json({ error: 'Failed to fetch loan' }, { status: 500 })
  }
}

// PUT /api/loans/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const loans = await readLoans()
    const index = loans.findIndex(loan => loan.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }
    
    // Update loan with new data
    loans[index] = {
      ...loans[index],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    await writeLoans(loans)
    return NextResponse.json(loans[index])
  } catch (error) {
    console.error('Failed to update loan:', error)
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 })
  }
}

// DELETE /api/loans/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loans = await readLoans()
    const index = loans.findIndex(loan => loan.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }
    
    const deletedLoan = loans.splice(index, 1)[0]
    await writeLoans(loans)
    
    return NextResponse.json({ 
      message: 'Loan deleted successfully', 
      loan: deletedLoan 
    })
  } catch (error) {
    console.error('Failed to delete loan:', error)
    return NextResponse.json({ error: 'Failed to delete loan' }, { status: 500 })
  }
}
