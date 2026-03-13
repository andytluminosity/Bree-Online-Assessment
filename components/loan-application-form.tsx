'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ProgressStepper } from '@/components/progress-stepper'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/mock-data'
import { 
  User, 
  Briefcase, 
  DollarSign, 
  FileUp, 
  CheckCircle2, 
  HelpCircle,
  Upload,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2
} from 'lucide-react'

const steps = [
  { id: 1, title: 'Personal Info', description: 'Basic details' },
  { id: 2, title: 'Employment', description: 'Job & income' },
  { id: 3, title: 'Financial', description: 'Loan details' },
  { id: 4, title: 'Documents', description: 'Upload files' },
  { id: 5, title: 'Review', description: 'Confirm & submit' },
]

interface FormData {
  // Personal
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  ssn: string
  address: string
  city: string
  state: string
  zipCode: string
  // Employment
  employmentStatus: string
  employerName: string
  jobTitle: string
  yearsEmployed: string
  annualIncome: string
  // Financial
  monthlyExpenses: string
  existingDebts: string
  loanAmount: string
  loanPurpose: string
  loanTerm: string
  // Documents
  documents: File[]
  // Terms
  acceptTerms: boolean
  acceptPrivacy: boolean
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  ssn: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  employmentStatus: '',
  employerName: '',
  jobTitle: '',
  yearsEmployed: '',
  annualIncome: '',
  monthlyExpenses: '',
  existingDebts: '',
  loanAmount: '',
  loanPurpose: '',
  loanTerm: '',
  documents: [],
  acceptTerms: false,
  acceptPrivacy: false,
}

export function LoanApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const updateFormData = (field: keyof FormData, value: string | boolean | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return !!(formData.firstName && 
                  formData.lastName && 
                  formData.email && 
                  formData.phone && 
                  formData.dateOfBirth && 
                  formData.ssn && 
                  formData.address && 
                  formData.city && 
                  formData.state && 
                  formData.zipCode)
      
      case 2:
        return !!(formData.employmentStatus && 
                  formData.employerName && 
                  formData.jobTitle && 
                  formData.yearsEmployed && 
                  formData.annualIncome)
      
      case 3:
        return !!(formData.monthlyExpenses && 
                  formData.existingDebts && 
                  formData.loanAmount && 
                  formData.loanPurpose && 
                  formData.loanTerm)
      
      case 4:
        return formData.documents.length > 0
      
      case 5:
        return !!(formData.acceptTerms && formData.acceptPrivacy)
      
      default:
        return false
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      updateFormData('documents', [...formData.documents, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = formData.documents.filter((_, i) => i !== index)
    updateFormData('documents', newFiles)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/loan-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      const submittedApplication = await response.json()
      console.log('Application submitted:', submittedApplication)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting application:', error)
      // You could add error handling here, like showing a toast or alert
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Your loan application has been received. We'll review it and get back to you within 24-48 hours.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
            <p className="text-sm text-muted-foreground">Application ID</p>
            <p className="text-lg font-semibold text-foreground">LA-2024-006</p>
          </div>
          <Button onClick={() => window.location.href = '/dashboard'}>
            View Application Status
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="mb-8 hidden md:block">
          <ProgressStepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="md:hidden mb-6">
          <p className="text-sm text-muted-foreground mb-1">Step {currentStep} of {steps.length}</p>
          <h2 className="text-lg font-semibold text-foreground">{steps[currentStep - 1].title}</h2>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="hidden md:block">
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <User className="h-5 w-5 text-primary" />}
              {currentStep === 2 && <Briefcase className="h-5 w-5 text-primary" />}
              {currentStep === 3 && <DollarSign className="h-5 w-5 text-primary" />}
              {currentStep === 4 && <FileUp className="h-5 w-5 text-primary" />}
              {currentStep === 5 && <CheckCircle2 className="h-5 w-5 text-primary" />}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="ssn">Social Security Number</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your SSN is encrypted and securely stored</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="ssn"
                      type="password"
                      value={formData.ssn}
                      onChange={(e) => updateFormData('ssn', e.target.value)}
                      placeholder="XXX-XX-XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="San Francisco"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => updateFormData('state', value)}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => updateFormData('zipCode', e.target.value)}
                      placeholder="94102"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Employment & Income */}
            {currentStep === 2 && (
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => updateFormData('employmentStatus', value)}
                  >
                    <SelectTrigger id="employmentStatus">
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time Employee</SelectItem>
                      <SelectItem value="part-time">Part-time Employee</SelectItem>
                      <SelectItem value="self-employed">Self-employed</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employerName">Employer Name</Label>
                    <Input
                      id="employerName"
                      value={formData.employerName}
                      onChange={(e) => updateFormData('employerName', e.target.value)}
                      placeholder="Company Inc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => updateFormData('jobTitle', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="yearsEmployed">Years at Current Job</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Longer employment history may improve approval chances</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="yearsEmployed"
                      type="number"
                      min="0"
                      value={formData.yearsEmployed}
                      onChange={(e) => updateFormData('yearsEmployed', e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="annualIncome">Annual Income (before taxes)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Include salary, bonuses, and other regular income</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="annualIncome"
                        type="number"
                        min="0"
                        className="pl-7"
                        value={formData.annualIncome}
                        onChange={(e) => updateFormData('annualIncome', e.target.value)}
                        placeholder="75,000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Financial Details */}
            {currentStep === 3 && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Include rent, utilities, groceries, etc.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="monthlyExpenses"
                        type="number"
                        min="0"
                        className="pl-7"
                        value={formData.monthlyExpenses}
                        onChange={(e) => updateFormData('monthlyExpenses', e.target.value)}
                        placeholder="3,500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="existingDebts">Existing Debts</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total of all current loans and credit card balances</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="existingDebts"
                        type="number"
                        min="0"
                        className="pl-7"
                        value={formData.existingDebts}
                        onChange={(e) => updateFormData('existingDebts', e.target.value)}
                        placeholder="15,000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="loanAmount">Requested Loan Amount</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Loans from $5,000 to $250,000 are available</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="loanAmount"
                      type="number"
                      min="5000"
                      max="250000"
                      className="pl-7"
                      value={formData.loanAmount}
                      onChange={(e) => updateFormData('loanAmount', e.target.value)}
                      placeholder="50,000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanPurpose">Loan Purpose</Label>
                  <Select
                    value={formData.loanPurpose}
                    onValueChange={(value) => updateFormData('loanPurpose', value)}
                  >
                    <SelectTrigger id="loanPurpose">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home-improvement">Home Improvement</SelectItem>
                      <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                      <SelectItem value="business">Business Expansion</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="vehicle">Vehicle Purchase</SelectItem>
                      <SelectItem value="medical">Medical Expenses</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanTerm">Loan Term</Label>
                  <Select
                    value={formData.loanTerm}
                    onValueChange={(value) => updateFormData('loanTerm', value)}
                  >
                    <SelectTrigger id="loanTerm">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                      <SelectItem value="48">48 months</SelectItem>
                      <SelectItem value="60">60 months</SelectItem>
                      <SelectItem value="84">84 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.loanAmount && formData.loanTerm && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-2">Estimated Monthly Payment</h4>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(
                        (Number(formData.loanAmount) * 1.08) / Number(formData.loanTerm)
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on estimated 8% APR. Final rate depends on credit evaluation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <div className="grid gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label>Required Documents</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload clear, readable copies of all documents</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Government-issued ID</p>
                        <p className="text-xs text-muted-foreground">Driver's license, passport, or state ID</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Proof of Income</p>
                        <p className="text-xs text-muted-foreground">Last 2-3 pay stubs or tax returns</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Bank Statements</p>
                        <p className="text-xs text-muted-foreground">Last 3 months of statements</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG or PNG (max 10MB per file)
                    </p>
                  </label>
                </div>

                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    <div className="grid gap-2">
                      {formData.documents.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{formData.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">{formData.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium text-foreground">
                          {formData.address ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Employment Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium text-foreground">{formData.employmentStatus || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Employer</p>
                        <p className="font-medium text-foreground">{formData.employerName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Job Title</p>
                        <p className="font-medium text-foreground">{formData.jobTitle || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Annual Income</p>
                        <p className="font-medium text-foreground">
                          {formData.annualIncome ? formatCurrency(Number(formData.annualIncome)) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Loan Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Loan Amount</p>
                        <p className="font-medium text-foreground">
                          {formData.loanAmount ? formatCurrency(Number(formData.loanAmount)) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purpose</p>
                        <p className="font-medium text-foreground">{formData.loanPurpose || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Term</p>
                        <p className="font-medium text-foreground">
                          {formData.loanTerm ? `${formData.loanTerm} months` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Documents</p>
                        <p className="font-medium text-foreground">{formData.documents.length} uploaded</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => updateFormData('acceptTerms', !!checked)}
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-relaxed">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and acknowledge that I have read and understand the loan agreement terms.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked) => updateFormData('acceptPrivacy', !!checked)}
                    />
                    <label htmlFor="acceptPrivacy" className="text-sm text-muted-foreground leading-relaxed">
                      I consent to the <a href="#" className="text-primary hover:underline">Privacy Policy</a> and authorize LendAI to verify my information with credit bureaus.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                  disabled={!validateCurrentStep()}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.acceptTerms || !formData.acceptPrivacy || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
