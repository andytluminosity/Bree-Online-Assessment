'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  mockApplications, 
  formatCurrency, 
  formatDate, 
  getStatusColor,
  getRiskScoreColor,
  type LoanApplication 
} from '@/lib/mock-data'
import {
  Search,
  Filter,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Loader2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

type SortField = 'submittedAt' | 'riskScore' | 'loanAmount' | 'annualIncome'
type SortOrder = 'asc' | 'desc'

function RiskScoreMeter({ score }: { score: number }) {
  const getBarColor = (threshold: number) => {
    if (score >= threshold) {
      if (threshold >= 80) return 'bg-success'
      if (threshold >= 60) return 'bg-primary'
      if (threshold >= 40) return 'bg-warning'
      return 'bg-destructive'
    }
    return 'bg-muted'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[20, 40, 60, 80, 100].map((threshold) => (
          <div
            key={threshold}
            className={`h-4 w-1.5 rounded-sm ${getBarColor(threshold)}`}
          />
        ))}
      </div>
      <span className={`text-sm font-semibold ${getRiskScoreColor(score)}`}>{score}</span>
    </div>
  )
}

export default function AdminPage() {
  const [applications, setApplications] = useState<LoanApplication[]>(mockApplications)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('submittedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [actionNotes, setActionNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter and sort applications
  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesRisk =
        riskFilter === 'all' ||
        (riskFilter === 'high' && app.riskScore >= 80) ||
        (riskFilter === 'medium' && app.riskScore >= 50 && app.riskScore < 80) ||
        (riskFilter === 'low' && app.riskScore < 50)
      return matchesSearch && matchesStatus && matchesRisk
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'submittedAt':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
          break
        case 'riskScore':
          comparison = a.riskScore - b.riskScore
          break
        case 'loanAmount':
          comparison = a.loanAmount - b.loanAmount
          break
        case 'annualIncome':
          comparison = a.annualIncome - b.annualIncome
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleViewApplication = (app: LoanApplication) => {
    setSelectedApplication(app)
    setIsSheetOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedApplication) return
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApplication.id ? { ...app, status: 'approved' as const } : app
      )
    )
    setSelectedApplication((prev) => (prev ? { ...prev, status: 'approved' as const } : null))
    setIsProcessing(false)
    setIsApproveDialogOpen(false)
    setActionNotes('')
  }

  const handleReject = async () => {
    if (!selectedApplication) return
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApplication.id ? { ...app, status: 'rejected' as const } : app
      )
    )
    setSelectedApplication((prev) => (prev ? { ...prev, status: 'rejected' as const } : null))
    setIsProcessing(false)
    setIsRejectDialogOpen(false)
    setActionNotes('')
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      {sortField === field && (
        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  )

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => ['submitted', 'under_review'].includes(a.status)).length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    avgRiskScore: Math.round(applications.reduce((sum, a) => sum + a.riskScore, 0) / applications.length),
    totalVolume: applications.reduce((sum, a) => sum + a.loanAmount, 0),
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and manage loan applications</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-bold text-warning-foreground">{stats.pending}</p>
                </div>
                <Clock className="h-5 w-5 text-warning-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Approved</p>
                  <p className="text-2xl font-bold text-success">{stats.approved}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Rejected</p>
                  <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                </div>
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Risk</p>
                  <p className={`text-2xl font-bold ${getRiskScoreColor(stats.avgRiskScore)}`}>
                    {stats.avgRiskScore}
                  </p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Volume</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalVolume)}</p>
                </div>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="disbursed">Disbursed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="high">High (80+)</SelectItem>
                    <SelectItem value="medium">Medium (50-79)</SelectItem>
                    <SelectItem value="low">Low (0-49)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              Showing {filteredApplications.length} of {applications.length} applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Applicant</TableHead>
                    <TableHead className="font-semibold">
                      <SortButton field="loanAmount">Amount</SortButton>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <SortButton field="annualIncome">Income</SortButton>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <SortButton field="riskScore">AI Risk Score</SortButton>
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Flags</TableHead>
                    <TableHead className="font-semibold">
                      <SortButton field="submittedAt">Submitted</SortButton>
                    </TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/30 cursor-pointer">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{app.applicantName}</p>
                          <p className="text-sm text-muted-foreground">{app.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(app.loanAmount)}</TableCell>
                      <TableCell>{formatCurrency(app.annualIncome)}</TableCell>
                      <TableCell>
                        <RiskScoreMeter score={app.riskScore} />
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.fraudFlags.length > 0 ? (
                          <div className="flex items-center gap-1 text-warning-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">{app.fraudFlags.length}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(app.submittedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewApplication(app)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Application Detail Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            {selectedApplication && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    {selectedApplication.id}
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status.replace('_', ' ')}
                    </Badge>
                  </SheetTitle>
                  <SheetDescription>
                    Submitted on {formatDate(selectedApplication.submittedAt)}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* AI Risk Score */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        AI Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className={`text-4xl font-bold ${getRiskScoreColor(selectedApplication.riskScore)}`}>
                            {selectedApplication.riskScore}
                          </p>
                          <p className="text-sm text-muted-foreground">Risk Score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">
                            {formatCurrency(selectedApplication.recommendedAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">Recommended Amount</p>
                        </div>
                      </div>
                      <Progress value={selectedApplication.riskScore} className="h-2" />
                      
                      {selectedApplication.fraudFlags.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-warning-foreground" />
                            <span className="text-sm font-medium text-foreground">Fraud Flags</span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {selectedApplication.fraudFlags.map((flag, index) => (
                              <li key={index}>• {flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Applicant Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Applicant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium text-foreground">{selectedApplication.applicantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium text-foreground">{selectedApplication.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium text-foreground">{selectedApplication.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-medium text-foreground text-right">
                          {selectedApplication.city}, {selectedApplication.state}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employment */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Employment & Income</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium text-foreground">{selectedApplication.employmentStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employer</span>
                        <span className="font-medium text-foreground">{selectedApplication.employerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job Title</span>
                        <span className="font-medium text-foreground">{selectedApplication.jobTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Years Employed</span>
                        <span className="font-medium text-foreground">{selectedApplication.yearsEmployed} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Income</span>
                        <span className="font-medium text-foreground">{formatCurrency(selectedApplication.annualIncome)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Loan Details */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Loan Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium text-foreground">{formatCurrency(selectedApplication.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purpose</span>
                        <span className="font-medium text-foreground">{selectedApplication.loanPurpose}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Term</span>
                        <span className="font-medium text-foreground">{selectedApplication.loanTerm} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Rate</span>
                        <span className="font-medium text-foreground">{selectedApplication.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Payment</span>
                        <span className="font-medium text-foreground">{formatCurrency(selectedApplication.monthlyPayment)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedApplication.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{doc.name}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              doc.status === 'approved'
                                ? 'border-success/50 text-success'
                                : doc.status === 'pending'
                                ? 'border-warning/50 text-warning-foreground'
                                : 'border-destructive/50 text-destructive'
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  {['submitted', 'under_review'].includes(selectedApplication.status) && (
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => setIsApproveDialogOpen(true)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={() => setIsRejectDialogOpen(true)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Approve Application
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this loan application? This action will notify the applicant.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Application ID</p>
                <p className="font-medium text-foreground">{selectedApplication?.id}</p>
                <p className="text-sm text-muted-foreground mt-2">Amount</p>
                <p className="font-medium text-foreground">{formatCurrency(selectedApplication?.loanAmount || 0)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approveNotes">Notes (optional)</Label>
                <Textarea
                  id="approveNotes"
                  placeholder="Add any notes for the approval..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={isProcessing} className="gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Approval
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Reject Application
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this loan application? This action will notify the applicant.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Application ID</p>
                <p className="font-medium text-foreground">{selectedApplication?.id}</p>
                <p className="text-sm text-muted-foreground mt-2">Amount</p>
                <p className="font-medium text-foreground">{formatCurrency(selectedApplication?.loanAmount || 0)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejectNotes">Reason for rejection</Label>
                <Textarea
                  id="rejectNotes"
                  placeholder="Please provide a reason..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={isProcessing} className="gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
