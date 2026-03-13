// Mock data for the fintech loan application

export interface LoanApplication {
  id: string
  applicantName: string
  email: string
  phone: string
  dateOfBirth: string
  ssn: string
  address: string
  city: string
  state: string
  zipCode: string
  employmentStatus: string
  employerName: string
  jobTitle: string
  yearsEmployed: number
  annualIncome: number
  monthlyExpenses: number
  existingDebts: number
  loanAmount: number
  loanPurpose: string
  loanTerm: number
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed'
  riskScore: number
  recommendedAmount: number
  interestRate: number
  monthlyPayment: number
  submittedAt: string
  updatedAt: string
  fraudFlags: string[]
  documents: { name: string; status: 'pending' | 'approved' | 'rejected' }[]
}

export interface Notification {
  id: string
  type: 'document_request' | 'approval' | 'disbursement' | 'info' | 'warning'
  title: string
  message: string
  timestamp: string
  read: boolean
  applicationId?: string
}

export const mockApplications: LoanApplication[] = [
  {
    id: 'LA-2024-001',
    applicantName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1985-03-15',
    ssn: '***-**-4521',
    address: '123 Oak Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    employmentStatus: 'Full-time',
    employerName: 'Tech Corp Inc.',
    jobTitle: 'Senior Engineer',
    yearsEmployed: 5,
    annualIncome: 145000,
    monthlyExpenses: 4500,
    existingDebts: 15000,
    loanAmount: 50000,
    loanPurpose: 'Home Improvement',
    loanTerm: 60,
    status: 'approved',
    riskScore: 82,
    recommendedAmount: 55000,
    interestRate: 7.5,
    monthlyPayment: 1001.45,
    submittedAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:22:00Z',
    fraudFlags: [],
    documents: [
      { name: 'Pay Stubs', status: 'approved' },
      { name: 'Bank Statements', status: 'approved' },
      { name: 'ID Verification', status: 'approved' },
    ],
  },
  {
    id: 'LA-2024-002',
    applicantName: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1990-07-22',
    ssn: '***-**-8834',
    address: '456 Pine Avenue',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    employmentStatus: 'Full-time',
    employerName: 'Finance Plus LLC',
    jobTitle: 'Financial Analyst',
    yearsEmployed: 3,
    annualIncome: 95000,
    monthlyExpenses: 3200,
    existingDebts: 8000,
    loanAmount: 25000,
    loanPurpose: 'Debt Consolidation',
    loanTerm: 36,
    status: 'under_review',
    riskScore: 71,
    recommendedAmount: 22000,
    interestRate: 9.2,
    monthlyPayment: 797.12,
    submittedAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    fraudFlags: ['Income verification pending'],
    documents: [
      { name: 'Pay Stubs', status: 'approved' },
      { name: 'Bank Statements', status: 'pending' },
      { name: 'ID Verification', status: 'approved' },
    ],
  },
  {
    id: 'LA-2024-003',
    applicantName: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: '1988-11-08',
    ssn: '***-**-2156',
    address: '789 Maple Drive',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    employmentStatus: 'Self-employed',
    employerName: 'Rodriguez Consulting',
    jobTitle: 'Owner',
    yearsEmployed: 6,
    annualIncome: 180000,
    monthlyExpenses: 6000,
    existingDebts: 45000,
    loanAmount: 100000,
    loanPurpose: 'Business Expansion',
    loanTerm: 84,
    status: 'disbursed',
    riskScore: 88,
    recommendedAmount: 100000,
    interestRate: 6.8,
    monthlyPayment: 1567.23,
    submittedAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-12T11:00:00Z',
    fraudFlags: [],
    documents: [
      { name: 'Tax Returns', status: 'approved' },
      { name: 'Business License', status: 'approved' },
      { name: 'Bank Statements', status: 'approved' },
      { name: 'ID Verification', status: 'approved' },
    ],
  },
  {
    id: 'LA-2024-004',
    applicantName: 'David Thompson',
    email: 'david.t@email.com',
    phone: '(555) 456-7890',
    dateOfBirth: '1975-04-30',
    ssn: '***-**-7743',
    address: '321 Cedar Lane',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    employmentStatus: 'Full-time',
    employerName: 'Healthcare Systems',
    jobTitle: 'IT Director',
    yearsEmployed: 12,
    annualIncome: 165000,
    monthlyExpenses: 5500,
    existingDebts: 120000,
    loanAmount: 75000,
    loanPurpose: 'Vehicle Purchase',
    loanTerm: 48,
    status: 'rejected',
    riskScore: 42,
    recommendedAmount: 30000,
    interestRate: 12.5,
    monthlyPayment: 2003.56,
    submittedAt: '2024-01-18T13:20:00Z',
    updatedAt: '2024-01-19T10:30:00Z',
    fraudFlags: ['High debt-to-income ratio', 'Recent credit inquiries'],
    documents: [
      { name: 'Pay Stubs', status: 'approved' },
      { name: 'Bank Statements', status: 'rejected' },
      { name: 'ID Verification', status: 'approved' },
    ],
  },
  {
    id: 'LA-2024-005',
    applicantName: 'Jessica Williams',
    email: 'jessica.w@email.com',
    phone: '(555) 567-8901',
    dateOfBirth: '1992-09-12',
    ssn: '***-**-5589',
    address: '654 Birch Road',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    employmentStatus: 'Full-time',
    employerName: 'Creative Agency Co.',
    jobTitle: 'Art Director',
    yearsEmployed: 4,
    annualIncome: 110000,
    monthlyExpenses: 3800,
    existingDebts: 22000,
    loanAmount: 35000,
    loanPurpose: 'Education',
    loanTerm: 60,
    status: 'submitted',
    riskScore: 76,
    recommendedAmount: 35000,
    interestRate: 8.1,
    monthlyPayment: 712.34,
    submittedAt: '2024-01-21T08:00:00Z',
    updatedAt: '2024-01-21T08:00:00Z',
    fraudFlags: [],
    documents: [
      { name: 'Pay Stubs', status: 'pending' },
      { name: 'Bank Statements', status: 'pending' },
      { name: 'ID Verification', status: 'pending' },
    ],
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'document_request',
    title: 'Document Required',
    message: 'Please upload your most recent bank statement for application LA-2024-002.',
    timestamp: '2024-01-21T14:30:00Z',
    read: false,
    applicationId: 'LA-2024-002',
  },
  {
    id: 'n2',
    type: 'approval',
    title: 'Application Approved',
    message: 'Congratulations! Your loan application LA-2024-001 has been approved for $50,000.',
    timestamp: '2024-01-18T14:22:00Z',
    read: true,
    applicationId: 'LA-2024-001',
  },
  {
    id: 'n3',
    type: 'disbursement',
    title: 'Funds Disbursed',
    message: 'Your loan funds of $100,000 have been transferred to your account ending in 4521.',
    timestamp: '2024-01-12T11:00:00Z',
    read: true,
    applicationId: 'LA-2024-003',
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Application Submitted',
    message: 'Your application LA-2024-005 has been received and is being processed.',
    timestamp: '2024-01-21T08:05:00Z',
    read: false,
    applicationId: 'LA-2024-005',
  },
  {
    id: 'n5',
    type: 'warning',
    title: 'Action Required',
    message: 'Your application LA-2024-004 requires additional documentation.',
    timestamp: '2024-01-19T09:00:00Z',
    read: false,
    applicationId: 'LA-2024-004',
  },
]

export const generateRepaymentSchedule = (
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date = new Date()
) => {
  const monthlyRate = annualRate / 100 / 12
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)

  const schedule = []
  let balance = principal

  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    balance -= principalPayment

    const paymentDate = new Date(startDate)
    paymentDate.setMonth(paymentDate.getMonth() + i)

    schedule.push({
      paymentNumber: i,
      dueDate: paymentDate.toISOString().split('T')[0],
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
      status: i <= 3 ? 'paid' : i === 4 ? 'due' : 'upcoming',
    })
  }

  return schedule
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getStatusColor = (status: LoanApplication['status']) => {
  switch (status) {
    case 'submitted':
      return 'bg-secondary text-secondary-foreground'
    case 'under_review':
      return 'bg-warning/20 text-warning-foreground'
    case 'approved':
      return 'bg-primary/20 text-primary'
    case 'rejected':
      return 'bg-destructive/20 text-destructive'
    case 'disbursed':
      return 'bg-success/20 text-success'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export const getRiskScoreColor = (score: number) => {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-primary'
  if (score >= 40) return 'text-warning-foreground'
  return 'text-destructive'
}
