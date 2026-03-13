'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
  mockApplications, 
  formatCurrency, 
  formatDate, 
  generateRepaymentSchedule 
} from '@/lib/mock-data'
import {
  Download,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  ArrowDownToLine,
  Info,
} from 'lucide-react'

// Use the first approved/disbursed application for demo
const loanApplication = mockApplications.find(
  (app) => app.status === 'disbursed' || app.status === 'approved'
) || mockApplications[0]

const repaymentSchedule = generateRepaymentSchedule(
  loanApplication.loanAmount,
  loanApplication.interestRate,
  loanApplication.loanTerm,
  new Date('2024-02-01')
)

export default function LoanDetailsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const totalPaid = repaymentSchedule
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.payment, 0)

  const totalInterest = repaymentSchedule.reduce((sum, p) => sum + p.interest, 0)
  const progressPercent = (totalPaid / (loanApplication.monthlyPayment * loanApplication.loanTerm)) * 100

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Loan Details</h1>
              <Badge className="bg-success/20 text-success">
                {loanApplication.status === 'disbursed' ? 'Active' : 'Approved'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Application {loanApplication.id} • {loanApplication.loanPurpose}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Statement
            </Button>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              View Contract
            </Button>
          </div>
        </div>

        {/* Loan Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(loanApplication.loanAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="text-2xl font-bold text-foreground">{loanApplication.interestRate}% APR</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Term</p>
                  <p className="text-2xl font-bold text-foreground">{loanApplication.loanTerm} months</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(loanApplication.monthlyPayment)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Repayment Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Repayment Progress</CardTitle>
                <CardDescription>Track your loan repayment journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(totalPaid)} paid of {formatCurrency(loanApplication.monthlyPayment * loanApplication.loanTerm)}
                    </span>
                    <span className="text-sm font-medium text-foreground">{progressPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">Payments Made</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground">
                      {repaymentSchedule.filter((p) => p.status === 'paid').length} of {loanApplication.loanTerm}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">Next Payment</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground">
                      {formatDate(repaymentSchedule.find((p) => p.status === 'due')?.dueDate || '')}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Total Interest</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(totalInterest)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Loan Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Application ID</span>
                    <span className="font-medium text-foreground">{loanApplication.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Loan Purpose</span>
                    <span className="font-medium text-foreground">{loanApplication.loanPurpose}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Disbursement Date</span>
                    <span className="font-medium text-foreground">Feb 1, 2024</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Maturity Date</span>
                    <span className="font-medium text-foreground">
                      {formatDate(repaymentSchedule[repaymentSchedule.length - 1]?.dueDate || '')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium text-foreground">Auto-debit</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Disbursement Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Bank Name</span>
                    <span className="font-medium text-foreground">First National Bank</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="font-medium text-foreground">****4521</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Routing Number</span>
                    <span className="font-medium text-foreground">****7890</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-success/20 text-success">Disbursed</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Repayment Timeline Visual */}
            <Card>
              <CardHeader>
                <CardTitle>Repayment Timeline</CardTitle>
                <CardDescription>Visual representation of your payment journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {repaymentSchedule.slice(0, 6).map((payment, index) => (
                      <div key={payment.paymentNumber} className="relative pl-12">
                        <div
                          className={`absolute left-2 top-1 h-5 w-5 rounded-full flex items-center justify-center ${
                            payment.status === 'paid'
                              ? 'bg-success text-success-foreground'
                              : payment.status === 'due'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {payment.status === 'paid' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <span className="text-xs font-medium">{payment.paymentNumber}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              Payment {payment.paymentNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(payment.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              {formatCurrency(payment.payment)}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                payment.status === 'paid'
                                  ? 'border-success/50 text-success'
                                  : payment.status === 'due'
                                  ? 'border-primary/50 text-primary'
                                  : 'border-muted text-muted-foreground'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {repaymentSchedule.length > 6 && (
                      <div className="relative pl-12">
                        <div className="absolute left-2 top-1 h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">...</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          +{repaymentSchedule.length - 6} more payments
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Schedule Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Schedule</CardTitle>
                    <CardDescription>Complete breakdown of all monthly payments</CardDescription>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">#</TableHead>
                        <TableHead className="font-semibold">Due Date</TableHead>
                        <TableHead className="font-semibold text-right">Payment</TableHead>
                        <TableHead className="font-semibold text-right">Principal</TableHead>
                        <TableHead className="font-semibold text-right">Interest</TableHead>
                        <TableHead className="font-semibold text-right">Balance</TableHead>
                        <TableHead className="font-semibold text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repaymentSchedule.map((payment) => (
                        <TableRow key={payment.paymentNumber}>
                          <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                          <TableCell>{formatDate(payment.dueDate)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(payment.payment)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(payment.principal)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(payment.interest)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(payment.balance)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                payment.status === 'paid'
                                  ? 'border-success/50 text-success bg-success/10'
                                  : payment.status === 'due'
                                  ? 'border-primary/50 text-primary bg-primary/10'
                                  : 'border-muted text-muted-foreground'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/50 flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment Information</p>
                    <p className="text-sm text-muted-foreground">
                      Payments are automatically debited on the due date. Make sure sufficient funds are available.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Loan Documents</CardTitle>
                <CardDescription>Download important documents related to your loan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Loan Agreement</p>
                        <p className="text-sm text-muted-foreground">Signed on Feb 1, 2024 • PDF, 2.4 MB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowDownToLine className="h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Repayment Schedule</p>
                        <p className="text-sm text-muted-foreground">Generated Feb 1, 2024 • PDF, 156 KB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowDownToLine className="h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Disbursement Confirmation</p>
                        <p className="text-sm text-muted-foreground">Issued Feb 1, 2024 • PDF, 98 KB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowDownToLine className="h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Terms and Conditions</p>
                        <p className="text-sm text-muted-foreground">Version 2.1 • PDF, 1.8 MB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowDownToLine className="h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Monthly Statement - March 2024</p>
                        <p className="text-sm text-muted-foreground">Generated Mar 1, 2024 • PDF, 124 KB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowDownToLine className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
