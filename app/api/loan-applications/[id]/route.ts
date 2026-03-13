import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { LoanApplication } from '../route'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applications = await readLoanApplications()
    const application = applications.find(app => app.id === params.id)
    
    if (!application) {
      return NextResponse.json({ error: 'Loan application not found' }, { status: 404 })
    }
    
    return NextResponse.json(application)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch loan application' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const applications = await readLoanApplications()
    const index = applications.findIndex(app => app.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Loan application not found' }, { status: 404 })
    }
    
    // Update application with new data
    applications[index] = {
      ...applications[index],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    await writeLoanApplications(applications)
    return NextResponse.json(applications[index])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update loan application' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applications = await readLoanApplications()
    const index = applications.findIndex(app => app.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Loan application not found' }, { status: 404 })
    }
    
    const deletedApplication = applications.splice(index, 1)[0]
    await writeLoanApplications(applications)
    
    return NextResponse.json({ message: 'Loan application deleted successfully', application: deletedApplication })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete loan application' }, { status: 500 })
  }
}
