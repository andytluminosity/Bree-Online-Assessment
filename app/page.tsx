import { Navigation } from '@/components/navigation'
import { LoanApplicationForm } from '@/components/loan-application-form'

export default function LoanApplicationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Apply for a Loan</h1>
          <p className="text-muted-foreground text-lg">
            Get approved in minutes with our AI-powered lending platform. Secure, fast, and transparent.
          </p>
        </div>
        <LoanApplicationForm />
      </main>
    </div>
  )
}
