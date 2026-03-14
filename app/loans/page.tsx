'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface Loan {
  id: string
  loanApplicationId: string
  principalAmount: number
  interestRate: number
  loanTermMonths: number
  monthlyPayment: number
  status: string
  applicationDate: string
  approvalDate: string
  disbursementDate: string
  firstPaymentDate: string
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
  paymentMethod: string
  bankAccountNumber: string
  routingNumber: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface LoansResponse {
  loans: Loan[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [officerFilter, setOfficerFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<LoansResponse['pagination']>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDisburseDialogOpen, setIsDisburseDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    loanApplicationId: '',
    loanOfficerId: '',
    loanOfficerName: '',
    processingNotes: '',
    customInterestRate: '',
    customTermMonths: ''
  })

  // Fetch loans from API
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const params: any = {
          page: currentPage,
          limit: 50
        }
        
        if (statusFilter !== 'all') params.status = statusFilter
        if (officerFilter !== 'all') params.loanOfficerId = officerFilter
        
        const queryString = new URLSearchParams(params).toString()
        const response = await fetch(`/api/loans?${queryString}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch loans')
        }
        
        const data: LoansResponse = await response.json()
        setLoans(data.loans)
        setPagination(data.pagination)
      } catch (error) {
        console.error('Failed to fetch loans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [currentPage, statusFilter, officerFilter])

  const handleCreateLoan = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFormData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create loan')
      }

      const newLoan = await response.json()
      setLoans([newLoan, ...loans])
      setIsCreateDialogOpen(false)
      setCreateFormData({
        loanApplicationId: '',
        loanOfficerId: '',
        loanOfficerName: '',
        processingNotes: '',
        customInterestRate: '',
        customTermMonths: ''
      })
    } catch (error) {
      console.error('Failed to create loan:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisburseLoan = async () => {
    if (!selectedLoan) return
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/loans/${selectedLoan.id}/disburse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disbursementMethod: 'ACH',
          bankAccountNumber: '****1234',
          routingNumber: '123456789',
          notes: 'Standard ACH disbursement'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to disburse loan')
      }

      const disbursedLoan = await response.json()
      
      // Update loan in list
      setLoans(loans.map(loan => 
        loan.id === selectedLoan.id ? disbursedLoan : loan
      ))
      
      setIsDisburseDialogOpen(false)
      setSelectedLoan(null)
    } catch (error) {
      console.error('Failed to disburse loan:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_disbursement': return 'bg-warning/10 text-warning-foreground border-warning/20'
      case 'active': return 'bg-success/10 text-success-foreground border-success/20'
      case 'paid_off': return 'bg-primary/10 text-primary-foreground border-primary/20'
      case 'defaulted': return 'bg-destructive/10 text-destructive-foreground border-destructive/20'
      default: return 'bg-muted/10 text-muted-foreground border-muted/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_disbursement': return <Clock className="h-4 w-4" />
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'paid_off': return <CheckCircle className="h-4 w-4" />
      case 'defaulted': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredLoans = loans.filter(loan =>
    loan.borrowerFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.borrowerLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loans Management</h1>
            <p className="text-muted-foreground">Manage approved loans and disbursements</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Loan
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
              <p className="text-xs text-muted-foreground">Active loan portfolio</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Disbursement</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loans.filter(loan => loan.status === 'pending_disbursement').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready to disburse</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loans.filter(loan => loan.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(loans.reduce((sum, loan) => sum + loan.remainingBalance, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Total remaining balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search loans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_disbursement">Pending Disbursement</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paid_off">Paid Off</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loans Table */}
        <Card>
          <CardHeader>
            <CardTitle>Loans ({filteredLoans.length})</CardTitle>
            <CardDescription>Manage loan portfolio and disbursements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading loans...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {loan.borrowerFirstName} {loan.borrowerLastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {loan.borrowerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(loan.principalAmount)}</TableCell>
                      <TableCell>{(loan.interestRate * 100).toFixed(2)}%</TableCell>
                      <TableCell>{formatCurrency(loan.monthlyPayment)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(loan.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(loan.status)}
                            {loan.status.replace('_', ' ')}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(loan.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLoan(loan)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {loan.status === 'pending_disbursement' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedLoan(loan)
                                setIsDisburseDialogOpen(true)
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Disburse
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Create Loan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Loan</DialogTitle>
            <DialogDescription>
              Create a loan from an approved loan application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="loanApplicationId">Application ID</Label>
              <Input
                id="loanApplicationId"
                value={createFormData.loanApplicationId}
                onChange={(e) => setCreateFormData({...createFormData, loanApplicationId: e.target.value})}
                placeholder="e.g., LA-1234567890-ABCDEF"
              />
            </div>
            <div>
              <Label htmlFor="loanOfficerName">Loan Officer Name</Label>
              <Input
                id="loanOfficerName"
                value={createFormData.loanOfficerName}
                onChange={(e) => setCreateFormData({...createFormData, loanOfficerName: e.target.value})}
                placeholder="Loan officer name"
              />
            </div>
            <div>
              <Label htmlFor="customInterestRate">Interest Rate (Optional)</Label>
              <Input
                id="customInterestRate"
                type="number"
                step="0.001"
                value={createFormData.customInterestRate}
                onChange={(e) => setCreateFormData({...createFormData, customInterestRate: e.target.value})}
                placeholder="0.065 (6.5%)"
              />
            </div>
            <div>
              <Label htmlFor="customTermMonths">Term Months (Optional)</Label>
              <Input
                id="customTermMonths"
                type="number"
                value={createFormData.customTermMonths}
                onChange={(e) => setCreateFormData({...createFormData, customTermMonths: e.target.value})}
                placeholder="36"
              />
            </div>
            <div>
              <Label htmlFor="processingNotes">Processing Notes</Label>
              <Textarea
                id="processingNotes"
                value={createFormData.processingNotes}
                onChange={(e) => setCreateFormData({...createFormData, processingNotes: e.target.value})}
                placeholder="Any processing notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLoan} disabled={isProcessing}>
              {isProcessing ? 'Creating...' : 'Create Loan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disburse Loan Dialog */}
      <Dialog open={isDisburseDialogOpen} onOpenChange={setIsDisburseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disburse Loan</DialogTitle>
            <DialogDescription>
              Process disbursement for loan {selectedLoan?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Loan Details</h4>
              <div className="space-y-1 text-sm">
                <div>Borrower: {selectedLoan?.borrowerFirstName} {selectedLoan?.borrowerLastName}</div>
                <div>Amount: {selectedLoan && formatCurrency(selectedLoan.principalAmount)}</div>
                <div>Monthly Payment: {selectedLoan && formatCurrency(selectedLoan.monthlyPayment)}</div>
                <div>Term: {selectedLoan?.loanTermMonths} months</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisburseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDisburseLoan} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Disbursement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
