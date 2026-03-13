'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  mockApplications, 
  formatCurrency, 
  formatDate, 
  getStatusColor,
  getRiskScoreColor,
  type LoanApplication 
} from '@/lib/mock-data'
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Banknote,
} from 'lucide-react'
import Link from 'next/link'

const statusSteps = [
  { status: 'submitted', label: 'Submitted', icon: FileText },
  { status: 'under_review', label: 'Under Review', icon: Clock },
  { status: 'approved', label: 'Approved', icon: CheckCircle2 },
  { status: 'disbursed', label: 'Disbursed', icon: Banknote },
]

function StatusTimeline({ currentStatus }: { currentStatus: LoanApplication['status'] }) {
  const statusOrder = ['submitted', 'under_review', 'approved', 'disbursed']
  const currentIndex = statusOrder.indexOf(currentStatus)
  const isRejected = currentStatus === 'rejected'

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {statusSteps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = !isRejected && currentIndex >= index
          const isCurrent = !isRejected && statusOrder[currentIndex] === step.status

          return (
            <div key={step.status} className="flex flex-col items-center flex-1">
              <div className="relative">
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all
                    ${isCompleted 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-border bg-muted text-muted-foreground'
                    }
                    ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {isCurrent && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
      
      {/* Progress line */}
      <div className="absolute top-6 left-0 right-0 -z-10 mx-12">
        <div className="h-0.5 bg-border">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ 
              width: isRejected ? '0%' : `${Math.min(100, (currentIndex / (statusSteps.length - 1)) * 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  )
}

function RiskScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={getRiskScoreColor(score)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getRiskScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-muted-foreground">Risk Score</span>
      </div>
    </div>
  )
}

function ApplicationCard({ application }: { application: LoanApplication }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{application.id}</CardTitle>
            <CardDescription>{application.loanPurpose}</CardDescription>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Timeline */}
        <StatusTimeline currentStatus={application.status} />

        {application.status === 'rejected' && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">Application Rejected</p>
              <p className="text-xs text-muted-foreground">High debt-to-income ratio</p>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Requested</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(application.loanAmount)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Recommended</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(application.recommendedAmount)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Monthly</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(application.monthlyPayment)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Interest Rate</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{application.interestRate}%</p>
          </div>
        </div>

        {/* Risk Score & Next Steps */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <RiskScoreGauge score={application.riskScore} />
          
          <div className="flex-1 w-full">
            <h4 className="font-medium text-foreground mb-3">Next Steps</h4>
            <div className="space-y-2">
              {application.status === 'submitted' && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Application received</p>
                    <p className="text-xs text-muted-foreground">Review will begin within 24 hours</p>
                  </div>
                </div>
              )}
              {application.status === 'under_review' && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Document verification in progress</p>
                    <p className="text-xs text-muted-foreground">You may be contacted for additional information</p>
                  </div>
                </div>
              )}
              {application.status === 'approved' && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sign loan agreement</p>
                    <p className="text-xs text-muted-foreground">Complete signing to receive funds</p>
                  </div>
                </div>
              )}
              {application.status === 'disbursed' && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <Banknote className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Funds transferred</p>
                    <p className="text-xs text-muted-foreground">Check your bank account</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Status */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Document Status</h4>
          <div className="grid gap-2">
            {application.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{doc.name}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    doc.status === 'approved' 
                      ? 'border-primary/50 text-primary' 
                      : doc.status === 'pending'
                      ? 'border-warning/50 text-warning-foreground'
                      : 'border-destructive/50 text-destructive'
                  }
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/loan-details" className="flex-1">
            <Button className="w-full gap-2">
              View Full Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Download Summary
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Submitted on {formatDate(application.submittedAt)} • Last updated {formatDate(application.updatedAt)}
        </p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState('all')

  const filteredApplications = mockApplications.filter((app) => {
    if (selectedTab === 'all') return true
    return app.status === selectedTab
  })

  const stats = {
    total: mockApplications.length,
    approved: mockApplications.filter((a) => a.status === 'approved').length,
    pending: mockApplications.filter((a) => ['submitted', 'under_review'].includes(a.status)).length,
    totalAmount: mockApplications
      .filter((a) => a.status === 'approved' || a.status === 'disbursed')
      .reduce((sum, a) => sum + a.loanAmount, 0),
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your loan applications in one place.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Approved</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="under_review">Under Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="disbursed">Disbursed</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-6">
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any applications with this status.
                  </p>
                  <Link href="/">
                    <Button className="gap-2">
                      Apply for a Loan
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
