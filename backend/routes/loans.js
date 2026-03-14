const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Helper function to execute queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize loans table
async function initializeLoansTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS loans (
      id VARCHAR(255) PRIMARY KEY,
      loan_application_id VARCHAR(255) NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
      
      -- Loan details (from approved application)
      principal_amount DECIMAL(15, 2) NOT NULL,
      interest_rate DECIMAL(5, 4) NOT NULL,
      loan_term_months INTEGER NOT NULL,
      monthly_payment DECIMAL(15, 2) NOT NULL,
      
      -- Loan status and dates
      status VARCHAR(255) NOT NULL DEFAULT 'pending_disbursement',
      application_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      approval_date TIMESTAMP WITH TIME ZONE,
      disbursement_date TIMESTAMP WITH TIME ZONE,
      first_payment_date TIMESTAMP WITH TIME ZONE,
      maturity_date TIMESTAMP WITH TIME ZONE,
      
      -- Financial calculations
      total_interest DECIMAL(15, 2) NOT NULL,
      total_amount DECIMAL(15, 2) NOT NULL,
      remaining_balance DECIMAL(15, 2) NOT NULL,
      
      -- Borrower information (copied from application)
      borrower_first_name VARCHAR(255) NOT NULL,
      borrower_last_name VARCHAR(255) NOT NULL,
      borrower_email VARCHAR(255) NOT NULL,
      borrower_phone VARCHAR(255) NOT NULL,
      
      -- Loan officer and processing
      loan_officer_id VARCHAR(255),
      loan_officer_name VARCHAR(255),
      processing_notes TEXT,
      
      -- Payment information
      payment_method VARCHAR(255),
      bank_account_number VARCHAR(255),
      routing_number VARCHAR(255),
      
      -- Audit fields
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_by VARCHAR(255)
    );

    CREATE INDEX IF NOT EXISTS idx_loans_loan_application_id ON loans(loan_application_id);
    CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
    CREATE INDEX IF NOT EXISTS idx_loans_approval_date ON loans(approval_date);
    CREATE INDEX IF NOT EXISTS idx_loans_borrower_email ON loans(borrower_email);
  `;

  try {
    await query(createTableQuery);
    console.log('Loans table initialized successfully');
  } catch (error) {
    console.error('Failed to initialize loans table:', error);
    throw error;
  }
}

// Convert database row to API response format
function dbRowToLoan(row) {
  return {
    id: row.id,
    loanApplicationId: row.loan_application_id,
    principalAmount: parseFloat(row.principal_amount),
    interestRate: parseFloat(row.interest_rate),
    loanTermMonths: row.loan_term_months,
    monthlyPayment: parseFloat(row.monthly_payment),
    status: row.status,
    applicationDate: row.application_date,
    approvalDate: row.approval_date,
    disbursementDate: row.disbursement_date,
    firstPaymentDate: row.first_payment_date,
    maturityDate: row.maturity_date,
    totalInterest: parseFloat(row.total_interest),
    totalAmount: parseFloat(row.total_amount),
    remainingBalance: parseFloat(row.remaining_balance),
    borrowerFirstName: row.borrower_first_name,
    borrowerLastName: row.borrower_last_name,
    borrowerEmail: row.borrower_email,
    borrowerPhone: row.borrower_phone,
    loanOfficerId: row.loan_officer_id,
    loanOfficerName: row.loan_officer_name,
    processingNotes: row.processing_notes,
    paymentMethod: row.payment_method,
    bankAccountNumber: row.bank_account_number,
    routingNumber: row.routing_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

// Calculate loan details
function calculateLoanDetails(loanAmount, annualRate, termMonths) {
  const monthlyRate = annualRate / 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                      (Math.pow(1 + monthlyRate, termMonths) - 1);
  const totalAmount = monthlyPayment * termMonths;
  const totalInterest = totalAmount - loanAmount;
  
  // Calculate maturity date (assuming first payment in 30 days)
  const maturityDate = new Date();
  maturityDate.setMonth(maturityDate.getMonth() + termMonths);
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    maturityDate: maturityDate.toISOString(),
  };
}

// GET /api/loans
router.get('/', async (req, res) => {
  try {
    await initializeLoansTable();
    const { status, loanOfficerId, page = 1, limit = 50 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (status) {
      whereClause += ' AND status = $' + (params.length + 1);
      params.push(status);
    }
    
    if (loanOfficerId) {
      whereClause += ' AND loan_officer_id = $' + (params.length + 1);
      params.push(loanOfficerId);
    }
    
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) as total FROM loans ${whereClause}`;
    const dataQuery = `
      SELECT * FROM loans 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const countResult = await query(countQuery, params);
    const dataResult = await query(dataQuery, [...params, limit, offset]);
    
    const loans = dataResult.rows.map(dbRowToLoan);
    const totalCount = parseInt(countResult.rows[0].total);
    
    res.json({
      loans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch loans:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// POST /api/loans (create loan from approved application)
router.post('/', async (req, res) => {
  try {
    await initializeLoansTable();
    const { 
      loanApplicationId, 
      loanOfficerId, 
      loanOfficerName, 
      processingNotes,
      createdBy,
      customInterestRate,
      customTermMonths
    } = req.body;
    
    if (!loanApplicationId) {
      return res.status(400).json({ error: 'Loan application ID is required' });
    }
    
    // Get the approved loan application
    const appResult = await query('SELECT * FROM loan_applications WHERE id = $1 AND status = $2', 
      [loanApplicationId, 'approved']);
    
    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Approved loan application not found' });
    }
    
    const application = appResult.rows[0];
    
    // Use custom values or defaults from application
    const principalAmount = parseFloat(application.loan_amount);
    const interestRate = customInterestRate || 0.065; // 6.5% default
    const termMonths = customTermMonths || parseInt(application.loan_term);
    
    // Calculate loan details
    const loanDetails = calculateLoanDetails(principalAmount, interestRate, termMonths);
    
    // Create new loan
    const newLoan = {
      id: `LN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      loanApplicationId,
      principalAmount,
      interestRate,
      loanTermMonths: termMonths,
      monthlyPayment: loanDetails.monthlyPayment,
      status: 'pending_disbursement',
      applicationDate: new Date().toISOString(),
      approvalDate: new Date().toISOString(),
      totalInterest: loanDetails.totalInterest,
      totalAmount: loanDetails.totalAmount,
      remainingBalance: loanDetails.totalAmount,
      borrowerFirstName: application.first_name,
      borrowerLastName: application.last_name,
      borrowerEmail: application.email,
      borrowerPhone: application.phone,
      loanOfficerId,
      loanOfficerName,
      processingNotes,
      createdBy: createdBy || 'system',
    };
    
    // Insert into database
    const insertQuery = `
      INSERT INTO loans (
        id, loan_application_id, principal_amount, interest_rate, loan_term_months, monthly_payment,
        status, application_date, approval_date, total_interest, total_amount, remaining_balance,
        borrower_first_name, borrower_last_name, borrower_email, borrower_phone,
        loan_officer_id, loan_officer_name, processing_notes, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *
    `;
    
    const values = [
      newLoan.id, newLoan.loanApplicationId, newLoan.principalAmount, newLoan.interestRate,
      newLoan.loanTermMonths, newLoan.monthlyPayment, newLoan.status, newLoan.applicationDate,
      newLoan.approvalDate, newLoan.totalInterest, newLoan.totalAmount, newLoan.remainingBalance,
      newLoan.borrowerFirstName, newLoan.borrowerLastName, newLoan.borrowerEmail, newLoan.borrowerPhone,
      newLoan.loanOfficerId, newLoan.loanOfficerName, newLoan.processingNotes, newLoan.createdBy
    ];
    
    const result = await query(insertQuery, values);
    const savedLoan = dbRowToLoan(result.rows[0]);
    
    res.status(201).json(savedLoan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: 'Failed to create loan' });
  }
});

// GET /api/loans/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM loans WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const loan = dbRowToLoan(result.rows[0]);
    res.json(loan);
  } catch (error) {
    console.error('Failed to fetch loan:', error);
    res.status(500).json({ error: 'Failed to fetch loan' });
  }
});

// PUT /api/loans/:id
router.put('/:id', async (req, res) => {
  try {
    const body = req.body;
    
    // Check if loan exists
    const existingResult = await query('SELECT * FROM loans WHERE id = $1', [req.params.id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Update loan
    const updateQuery = `
      UPDATE loans SET
        status = $2, disbursement_date = $3, first_payment_date = $4, maturity_date = $5,
        remaining_balance = $6, payment_method = $7, bank_account_number = $8, routing_number = $9,
        loan_officer_id = $10, processing_notes = $11, updated_at = $12
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      req.params.id, body.status, body.disbursementDate, body.firstPaymentDate, body.maturityDate,
      body.remainingBalance, body.paymentMethod, body.bankAccountNumber, body.routingNumber,
      body.loanOfficerId, body.processingNotes, new Date().toISOString()
    ];
    
    const result = await query(updateQuery, values);
    const updatedLoan = dbRowToLoan(result.rows[0]);
    
    res.json(updatedLoan);
  } catch (error) {
    console.error('Failed to update loan:', error);
    res.status(500).json({ error: 'Failed to update loan' });
  }
});

// DELETE /api/loans/:id
router.delete('/:id', async (req, res) => {
  try {
    // Check if loan exists
    const existingResult = await query('SELECT * FROM loans WHERE id = $1', [req.params.id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Delete loan
    await query('DELETE FROM loans WHERE id = $1', [req.params.id]);
    const deletedLoan = dbRowToLoan(existingResult.rows[0]);
    
    res.json({ message: 'Loan deleted successfully', loan: deletedLoan });
  } catch (error) {
    console.error('Failed to delete loan:', error);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
});

// POST /api/loans/:id/disburse (mark loan as disbursed)
router.post('/:id/disburse', async (req, res) => {
  try {
    const { disbursementMethod, bankAccountNumber, routingNumber, notes } = req.body;
    
    // Check if loan exists and is pending disbursement
    const existingResult = await query('SELECT * FROM loans WHERE id = $1 AND status = $2', 
      [req.params.id, 'pending_disbursement']);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending loan not found' });
    }
    
    // Calculate first payment date (30 days from disbursement)
    const disbursementDate = new Date();
    const firstPaymentDate = new Date(disbursementDate);
    firstPaymentDate.setDate(firstPaymentDate.getDate() + 30);
    
    // Update loan status
    const updateQuery = `
      UPDATE loans SET
        status = $2, disbursement_date = $3, first_payment_date = $4,
        payment_method = $5, bank_account_number = $6, routing_number = $7,
        processing_notes = $8, updated_at = $9
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      req.params.id, 'active', disbursementDate.toISOString(), firstPaymentDate.toISOString(),
      disbursementMethod, bankAccountNumber, routingNumber, notes, new Date().toISOString()
    ];
    
    const result = await query(updateQuery, values);
    const disbursedLoan = dbRowToLoan(result.rows[0]);
    
    res.json(disbursedLoan);
  } catch (error) {
    console.error('Failed to disburse loan:', error);
    res.status(500).json({ error: 'Failed to disburse loan' });
  }
});

module.exports = router;
