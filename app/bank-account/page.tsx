"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Building2,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  AlertCircle,
  Landmark,
  Pencil,
  Star,
  Lock,
  Info,
} from "lucide-react"

interface BankAccount {
  id: string
  accountHolderName: string
  bankName: string
  accountType: "checking" | "savings"
  routingNumber: string
  accountNumber: string
  isDefault: boolean
  isVerified: boolean
  addedDate: string
}

const mockAccounts: BankAccount[] = [
  {
    id: "1",
    accountHolderName: "John Smith",
    bankName: "Chase Bank",
    accountType: "checking",
    routingNumber: "021000021",
    accountNumber: "****4567",
    isDefault: true,
    isVerified: true,
    addedDate: "2024-01-15",
  },
  {
    id: "2",
    accountHolderName: "John Smith",
    bankName: "Bank of America",
    accountType: "savings",
    routingNumber: "026009593",
    accountNumber: "****8901",
    isDefault: false,
    isVerified: true,
    addedDate: "2024-02-20",
  },
]

export default function BankAccountPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>(mockAccounts)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountType: "checking" as "checking" | "savings",
    routingNumber: "",
    accountNumber: "",
    confirmAccountNumber: "",
    setAsDefault: false,
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required"
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required"
    }

    if (!formData.routingNumber.trim()) {
      newErrors.routingNumber = "Routing number is required"
    } else if (!/^\d{9}$/.test(formData.routingNumber)) {
      newErrors.routingNumber = "Routing number must be 9 digits"
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required"
    } else if (!/^\d{4,17}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be 4-17 digits"
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newAccount: BankAccount = {
      id: Date.now().toString(),
      accountHolderName: formData.accountHolderName,
      bankName: formData.bankName,
      accountType: formData.accountType,
      routingNumber: formData.routingNumber,
      accountNumber: `****${formData.accountNumber.slice(-4)}`,
      isDefault: formData.setAsDefault || accounts.length === 0,
      isVerified: false,
      addedDate: new Date().toISOString().split("T")[0],
    }

    if (formData.setAsDefault) {
      setAccounts((prev) => prev.map((acc) => ({ ...acc, isDefault: false })))
    }

    setAccounts((prev) => [...prev, newAccount])
    setIsSubmitting(false)
    setShowAddForm(false)
    setShowSuccess(true)
    resetForm()

    setTimeout(() => setShowSuccess(false), 3000)
  }

  const resetForm = () => {
    setFormData({
      accountHolderName: "",
      bankName: "",
      accountType: "checking",
      routingNumber: "",
      accountNumber: "",
      confirmAccountNumber: "",
      setAsDefault: false,
      agreeToTerms: false,
    })
    setErrors({})
  }

  const handleSetDefault = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isDefault: acc.id === accountId,
      }))
    )
  }

  const handleDeleteAccount = () => {
    if (!accountToDelete) return

    const accountBeingDeleted = accounts.find((acc) => acc.id === accountToDelete)
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountToDelete))

    // If deleted account was default, set first remaining as default
    if (accountBeingDeleted?.isDefault) {
      setAccounts((prev) => {
        if (prev.length > 0) {
          return prev.map((acc, index) => ({
            ...acc,
            isDefault: index === 0,
          }))
        }
        return prev
      })
    }

    setShowDeleteDialog(false)
    setAccountToDelete(null)
  }

  const popularBanks = [
    "Chase Bank",
    "Bank of America",
    "Wells Fargo",
    "Citibank",
    "U.S. Bank",
    "PNC Bank",
    "Capital One",
    "TD Bank",
    "Truist Bank",
    "Other",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bank Account</h1>
          <p className="text-muted-foreground">
            Add and manage the financial institution where your loan funds will be deposited
          </p>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-success/50 bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Bank account added successfully. Verification pending.
            </AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Your information is secure</h3>
              <p className="text-sm text-muted-foreground">
                We use bank-level 256-bit encryption to protect your financial information. Your account details are
                never stored in plain text and are only used to process your loan disbursement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Existing Accounts */}
        {accounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Linked Accounts</h2>
            <div className="space-y-4">
              {accounts.map((account) => (
                <Card
                  key={account.id}
                  className={`transition-all ${account.isDefault ? "ring-2 ring-primary/50 border-primary/30" : ""}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-muted p-3">
                          <Landmark className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{account.bankName}</h3>
                            {account.isDefault && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {account.isVerified ? (
                              <Badge
                                variant="secondary"
                                className="bg-success/10 text-success text-xs"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-warning/10 text-warning-foreground text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{account.accountHolderName}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="capitalize">{account.accountType}</span>
                            <span>•</span>
                            <span>{account.accountNumber}</span>
                            <span>•</span>
                            <span>Added {new Date(account.addedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!account.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(account.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAccount(account)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAccountToDelete(account.id)
                            setShowDeleteDialog(true)
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Add New Account Button */}
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="mb-8">
            <Plus className="h-4 w-4 mr-2" />
            Add Bank Account
          </Button>
        )}

        {/* Add Account Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Add Bank Account
              </CardTitle>
              <CardDescription>
                Enter your bank account details for loan fund disbursement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Holder Name */}
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">
                  Account Holder Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountHolderName"
                  placeholder="Enter the name on the account"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className={errors.accountHolderName ? "border-destructive" : ""}
                />
                {errors.accountHolderName && (
                  <p className="text-sm text-destructive">{errors.accountHolderName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This must match the name on your bank account exactly
                </p>
              </div>

              {/* Bank Name */}
              <div className="space-y-2">
                <Label htmlFor="bankName">
                  Bank Name <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.bankName}
                  onValueChange={(value) => setFormData({ ...formData, bankName: value })}
                >
                  <SelectTrigger className={errors.bankName ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularBanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bankName && <p className="text-sm text-destructive">{errors.bankName}</p>}
              </div>

              {/* Account Type */}
              <div className="space-y-3">
                <Label>
                  Account Type <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.accountType}
                  onValueChange={(value: "checking" | "savings") =>
                    setFormData({ ...formData, accountType: value })
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checking" id="checking" />
                    <Label htmlFor="checking" className="cursor-pointer font-normal">
                      Checking
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="savings" id="savings" />
                    <Label htmlFor="savings" className="cursor-pointer font-normal">
                      Savings
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Routing and Account Numbers */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="routingNumber" className="flex items-center gap-2">
                    Routing Number <span className="text-destructive">*</span>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4" />
                    </button>
                  </Label>
                  <Input
                    id="routingNumber"
                    placeholder="9 digits"
                    maxLength={9}
                    value={formData.routingNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      setFormData({ ...formData, routingNumber: value })
                    }}
                    className={errors.routingNumber ? "border-destructive" : ""}
                  />
                  {errors.routingNumber && (
                    <p className="text-sm text-destructive">{errors.routingNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountNumber"
                    placeholder="4-17 digits"
                    maxLength={17}
                    value={formData.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      setFormData({ ...formData, accountNumber: value })
                    }}
                    className={errors.accountNumber ? "border-destructive" : ""}
                  />
                  {errors.accountNumber && (
                    <p className="text-sm text-destructive">{errors.accountNumber}</p>
                  )}
                </div>
              </div>

              {/* Confirm Account Number */}
              <div className="space-y-2">
                <Label htmlFor="confirmAccountNumber">
                  Confirm Account Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmAccountNumber"
                  placeholder="Re-enter your account number"
                  maxLength={17}
                  value={formData.confirmAccountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    setFormData({ ...formData, confirmAccountNumber: value })
                  }}
                  className={errors.confirmAccountNumber ? "border-destructive" : ""}
                />
                {errors.confirmAccountNumber && (
                  <p className="text-sm text-destructive">{errors.confirmAccountNumber}</p>
                )}
              </div>

              {/* Check Image Helper */}
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">Where to find your numbers</p>
                      <p className="text-muted-foreground">
                        You can find your routing and account numbers at the bottom of your checks, or in your
                        bank{"'"}s online banking portal. The routing number is typically the first 9 digits, followed
                        by your account number.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Set as Default */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="setAsDefault"
                  checked={formData.setAsDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, setAsDefault: checked as boolean })
                  }
                />
                <Label htmlFor="setAsDefault" className="cursor-pointer font-normal">
                  Set as default account for fund disbursement
                </Label>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeToTerms: checked as boolean })
                  }
                  className={errors.agreeToTerms ? "border-destructive" : ""}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="agreeToTerms" className="cursor-pointer font-normal text-sm">
                    I authorize LendAI to verify my bank account information and initiate deposits to this account.
                    I confirm that the account information provided is accurate.
                  </Label>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-destructive">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">
                        <Lock className="h-4 w-4" />
                      </span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Add Account Securely
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {accounts.length === 0 && !showAddForm && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Landmark className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No bank accounts linked</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Add a bank account to receive your loan funds. Your information is encrypted and secure.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Bank Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this bank account? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Remove Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
