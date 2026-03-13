import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { LoanApplication } from '../../route'

const DATA_FILE = path.join(process.cwd(), 'data', 'loan-applications.json')

async function readLoanApplications(): Promise<LoanApplication[]> {
  try {
    const data = await readFile(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeLoanApplications(applications: LoanApplication[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(applications, null, 2), 'utf8')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, flags } = body
    
    if (!status || !['pending', 'under_review', 'approved', 'rejected', 'needs_more_info'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    
    const applications = await readLoanApplications()
    const index = applications.findIndex(app => app.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Loan application not found' }, { status: 404 })
    }
    
    // Update status and flags
    applications[index].status = status
    if (flags && Array.isArray(flags)) {
      applications[index].flags = flags
    }
    applications[index].updatedAt = new Date().toISOString()
    
    await writeLoanApplications(applications)
    return NextResponse.json(applications[index])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update loan application status' }, { status: 500 })
  }
}
