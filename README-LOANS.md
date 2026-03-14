# Loans Management System Documentation

This document explains the loans management system that handles approved loan applications and loan disbursements.

## Overview

The loans system extends the loan application workflow by:
1. Creating loans from approved applications
2. Managing loan lifecycle (disbursement, active, paid off, etc.)
3. Tracking loan payments and balances
4. Providing loan portfolio management

## Database Schema

### loans Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key, unique loan ID |
| loan_application_id | VARCHAR(255) | Foreign key to loan_applications table |
| principal_amount | DECIMAL(15,2) | Original loan amount |
| interest_rate | DECIMAL(5,4) | Annual interest rate (e.g., 0.0650 for 6.50%) |
| loan_term_months | INTEGER | Loan term in months |
| monthly_payment | DECIMAL(15,2) | Calculated monthly payment |
| status | VARCHAR(255) | Current loan status |
| application_date | TIMESTAMP | Date loan application was processed |
| approval_date | TIMESTAMP | Date loan was approved |
| disbursement_date | TIMESTAMP | Date funds were disbursed |
| first_payment_date | TIMESTAMP | Date of first payment |
| maturity_date | TIMESTAMP | Loan maturity date |
| total_interest | DECIMAL(15,2) | Total interest over loan term |
| total_amount | DECIMAL(15,2) | Total amount (principal + interest) |
| remaining_balance | DECIMAL(15,2) | Current remaining balance |
| borrower_* fields | VARCHAR | Borrower information copied from application |
| loan_officer_* fields | VARCHAR | Loan officer information |
| payment_method | VARCHAR | Payment method (ACH, wire, check, etc.) |
| bank_account_number | VARCHAR | Encrypted bank account number |
| routing_number | VARCHAR | Bank routing number |
| processing_notes | TEXT | Internal processing notes |
| created_at/updated_at | TIMESTAMP | Audit timestamps |
| created_by | VARCHAR | Who created the loan record |

## Loan Statuses

| Status | Description |
|--------|-------------|
| pending_disbursement | Loan approved, awaiting disbursement |
| active | Loan is active and in repayment |
| paid_off | Loan fully paid off |
| defaulted | Loan is in default |
| paused | Payments temporarily paused |
| modified | Loan terms have been modified |

## API Endpoints

### GET /api/loans
Retrieve loans with filtering and pagination.

**Query Parameters:**
- `status` (optional) - Filter by loan status
- `loanOfficerId` (optional) - Filter by loan officer
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)

**Response:**
```json
{
  "loans": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### POST /api/loans
Create a new loan from an approved application.

**Request Body:**
```json
{
  "loanApplicationId": "LA-1234567890-ABCDEF",
  "loanOfficerId": "OFFICER-001",
  "loanOfficerName": "John Smith",
  "processingNotes": "Standard processing",
  "customInterestRate": "0.065", // Optional
  "customTermMonths": "36" // Optional
}
```

**Response:** Created loan object

### GET /api/loans/:id
Retrieve specific loan details.

### PUT /api/loans/:id
Update loan information.

**Request Body:**
```json
{
  "status": "active",
  "disbursementDate": "2024-03-15T10:00:00Z",
  "firstPaymentDate": "2024-04-15T10:00:00Z",
  "maturityDate": "2027-04-15T10:00:00Z",
  "remainingBalance": 45000.00,
  "paymentMethod": "ACH",
  "bankAccountNumber": "****1234",
  "routingNumber": "123456789",
  "loanOfficerId": "OFFICER-001",
  "processingNotes": "Updated payment information"
}
```

### DELETE /api/loans/:id
Delete a loan record (admin only).

### POST /api/loans/:id/disburse
Mark a loan as disbursed and activate it.

**Request Body:**
```json
{
  "disbursementMethod": "ACH",
  "bankAccountNumber": "****1234",
  "routingNumber": "123456789",
  "notes": "Standard ACH disbursement"
}
```

## Loan Calculations

### Monthly Payment Formula
```javascript
const monthlyRate = annualRate / 12;
const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                      (Math.pow(1 + monthlyRate, termMonths) - 1);
```

### Total Interest Formula
```javascript
const totalAmount = monthlyPayment * termMonths;
const totalInterest = totalAmount - principal;
```

### Maturity Date Calculation
```javascript
const maturityDate = new Date(disbursementDate);
maturityDate.setMonth(maturityDate.getMonth() + termMonths);
```

## Frontend Integration

### Loans Management Page (`/loans`)

**Features:**
- View all loans with pagination
- Filter by status and loan officer
- Search loans by borrower, email, or loan ID
- Create new loans from approved applications
- Process loan disbursements
- View loan details and history
- Portfolio statistics and metrics

**Key Components:**
- **Stats Cards:** Total loans, pending disbursements, active loans, portfolio value
- **Filters:** Status filter, search functionality
- **Loans Table:** Comprehensive loan listing with actions
- **Create Dialog:** Form to create loans from applications
- **Disburse Dialog:** Process loan disbursements

### API Integration

The frontend uses the API utility functions:

```typescript
import { api } from '@/lib/api'

// Get loans with filters
const loans = await api.getLoans({ 
  status: 'pending_disbursement', 
  page: 1, 
  limit: 50 
})

// Create loan from application
const loan = await api.createLoan({
  loanApplicationId: 'LA-1234567890-ABCDEF',
  loanOfficerName: 'John Smith'
})

// Disburse loan
const disbursed = await api.disburseLoan(loanId, {
  disbursementMethod: 'ACH',
  bankAccountNumber: '****1234',
  routingNumber: '123456789'
})
```

## Database Setup

Run the loans table setup script:

```bash
psql -U postgres -d loan_app_db -f database-loans-setup.sql
```

This will:
1. Create the `loans` table with proper constraints
2. Add foreign key relationship to `loan_applications`
3. Create performance indexes
4. Set up automatic timestamp updates
5. Add table comments for documentation

## Workflow

### 1. Loan Creation
1. Application gets approved in admin panel
2. Loan officer navigates to `/loans`
3. Clicks "Create Loan" and enters application ID
4. System fetches approved application details
5. Calculates loan terms (or uses custom values)
6. Creates loan record with "pending_disbursement" status

### 2. Loan Disbursement
1. Loan officer reviews pending loans
2. Clicks "Disburse" on a loan
3. Confirms disbursement details
4. System updates loan status to "active"
5. Sets first payment date (typically 30 days out)
6. Calculates maturity date

### 3. Loan Management
1. Active loans appear in portfolio
2. Loan officers can update loan details
3. Payment processing updates remaining balance
4. Status changes track loan lifecycle

## Security Considerations

### Data Protection
- Bank account numbers should be encrypted at rest
- Sensitive borrower information protected
- Audit trail maintained with created_by timestamps

### Access Control
- Only authorized loan officers can create/disburse loans
- Role-based access to different loan operations
- Admin oversight for all loan modifications

### Compliance
- All loan calculations follow regulatory standards
- Proper documentation for audit purposes
- Interest rate caps and term limits enforced

## Reporting

### Portfolio Metrics
- Total portfolio value
- Number of active loans
- Pending disbursements
- Default rates
- Average loan size

### Loan Performance
- Payment history
- Delinquency rates
- Prepayment statistics
- Profitability analysis

## Integration Points

### With Loan Applications
- Foreign key relationship ensures data integrity
- Approved applications only can become loans
- Application data copied to loan record

### With Payment System
- Payment processing updates remaining balance
- Payment history tracked per loan
- Automated status updates

### With User Management
- Loan officer assignments tracked
- Role-based permissions enforced
- Audit trail maintained

## Troubleshooting

### Common Issues

**Loan Creation Fails:**
- Verify application is approved
- Check application ID format
- Ensure loan officer has permissions

**Disbursement Errors:**
- Verify loan is in "pending_disbursement" status
- Check bank account information format
- Validate routing number

**Calculation Issues:**
- Verify interest rate format (decimal)
- Check term months (integer)
- Ensure principal amount is positive

### Database Issues

**Missing Data:**
- Run database setup script
- Check foreign key constraints
- Verify indexes are created

**Performance Problems:**
- Check query execution plans
- Verify indexes on status and dates
- Monitor connection pooling

This loans system provides a complete solution for managing the loan lifecycle from approval through repayment, with robust security, compliance features, and comprehensive reporting capabilities.
