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

// Initialize database
async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS loan_applications (
      id VARCHAR(255) PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      date_of_birth DATE NOT NULL,
      ssn VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      zip_code VARCHAR(255) NOT NULL,
      employment_status VARCHAR(255) NOT NULL,
      employer_name VARCHAR(255) NOT NULL,
      job_title VARCHAR(255) NOT NULL,
      years_employed VARCHAR(255) NOT NULL,
      annual_income VARCHAR(255) NOT NULL,
      monthly_expenses VARCHAR(255) NOT NULL,
      existing_debts VARCHAR(255) NOT NULL,
      loan_amount VARCHAR(255) NOT NULL,
      loan_purpose VARCHAR(255) NOT NULL,
      loan_term VARCHAR(255) NOT NULL,
      documents TEXT[],
      accept_terms BOOLEAN NOT NULL,
      accept_privacy BOOLEAN NOT NULL,
      ai_risk_score INTEGER NOT NULL,
      status VARCHAR(255) NOT NULL DEFAULT 'pending',
      flags TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
    CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at);
    CREATE INDEX IF NOT EXISTS idx_loan_applications_ai_risk_score ON loan_applications(ai_risk_score);
  `;

  try {
    await query(createTableQuery);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Convert database row to API response format
function dbRowToApplication(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    ssn: row.ssn,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    employmentStatus: row.employment_status,
    employerName: row.employer_name,
    jobTitle: row.job_title,
    yearsEmployed: row.years_employed,
    annualIncome: row.annual_income,
    monthlyExpenses: row.monthly_expenses,
    existingDebts: row.existing_debts,
    loanAmount: row.loan_amount,
    loanPurpose: row.loan_purpose,
    loanTerm: row.loan_term,
    documents: row.documents || [],
    acceptTerms: row.accept_terms,
    acceptPrivacy: row.accept_privacy,
    aiRiskScore: row.ai_risk_score,
    status: row.status,
    flags: row.flags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Calculate AI risk score
function calculateRiskScore(application) {
  let score = 50; // Base score
  
  // Income to loan amount ratio
  const income = parseFloat(application.annualIncome) || 0;
  const loanAmount = parseFloat(application.loanAmount) || 0;
  const ratio = loanAmount / income;
  
  if (ratio > 3) score -= 20;
  else if (ratio > 2) score -= 10;
  else if (ratio < 1) score += 10;
  
  // Employment stability
  const yearsEmployed = parseFloat(application.yearsEmployed) || 0;
  if (yearsEmployed < 1) score -= 15;
  else if (yearsEmployed > 3) score += 10;
  
  // Debt to income ratio
  const monthlyExpenses = parseFloat(application.monthlyExpenses) || 0;
  const existingDebts = parseFloat(application.existingDebts) || 0;
  const monthlyIncome = income / 12;
  const debtRatio = (monthlyExpenses + (existingDebts / 12)) / monthlyIncome;
  
  if (debtRatio > 0.5) score -= 25;
  else if (debtRatio > 0.3) score -= 10;
  else if (debtRatio < 0.2) score += 10;
  
  // Employment status
  if (application.employmentStatus === 'self-employed') score -= 5;
  else if (application.employmentStatus === 'full-time') score += 5;
  
  return Math.max(0, Math.min(100, score));
}

// Generate flags based on risk factors
function generateFlags(application, riskScore) {
  const flags = [];
  
  if (riskScore < 30) flags.push('high_risk');
  else if (riskScore < 50) flags.push('medium_risk');
  else flags.push('low_risk');
  
  const income = parseFloat(application.annualIncome) || 0;
  const loanAmount = parseFloat(application.loanAmount) || 0;
  
  if (loanAmount / income > 3) flags.push('high_loan_to_income');
  
  const yearsEmployed = parseFloat(application.yearsEmployed) || 0;
  if (yearsEmployed < 1) flags.push('unstable_employment');
  
  if (application.employmentStatus === 'self-employed') flags.push('self_employed');
  
  return flags;
}

// GET /api/loan-applications
router.get('/', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await query('SELECT * FROM loan_applications ORDER BY created_at DESC');
    const applications = result.rows.map(dbRowToApplication);
    res.json(applications);
  } catch (error) {
    console.error('Failed to fetch loan applications:', error);
    res.status(500).json({ error: 'Failed to fetch loan applications' });
  }
});

// POST /api/loan-applications
router.post('/', async (req, res) => {
  try {
    await initializeDatabase();
    const body = req.body;
    
    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'ssn',
      'address', 'city', 'state', 'zipCode', 'employmentStatus',
      'employerName', 'jobTitle', 'yearsEmployed', 'annualIncome',
      'monthlyExpenses', 'existingDebts', 'loanAmount', 'loanPurpose',
      'loanTerm', 'acceptTerms', 'acceptPrivacy'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    
    // Calculate risk score and flags
    const riskScore = calculateRiskScore(body);
    const flags = generateFlags(body, riskScore);
    
    // Create new loan application
    const newApplication = {
      ...body,
      id: `LA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      aiRiskScore: riskScore,
      status: 'pending',
      flags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: body.documents || []
    };
    
    // Insert into database
    const insertQuery = `
      INSERT INTO loan_applications (
        id, first_name, last_name, email, phone, date_of_birth, ssn, address, city, state, zip_code,
        employment_status, employer_name, job_title, years_employed, annual_income, monthly_expenses,
        existing_debts, loan_amount, loan_purpose, loan_term, documents, accept_terms, accept_privacy,
        ai_risk_score, status, flags, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29
      ) RETURNING *
    `;
    
    const values = [
      newApplication.id, newApplication.firstName, newApplication.lastName, newApplication.email, 
      newApplication.phone, newApplication.dateOfBirth, newApplication.ssn, newApplication.address, 
      newApplication.city, newApplication.state, newApplication.zipCode, newApplication.employmentStatus, 
      newApplication.employerName, newApplication.jobTitle, newApplication.yearsEmployed, 
      newApplication.annualIncome, newApplication.monthlyExpenses, newApplication.existingDebts,
      newApplication.loanAmount, newApplication.loanPurpose, newApplication.loanTerm, 
      newApplication.documents, newApplication.acceptTerms, newApplication.acceptPrivacy,
      newApplication.aiRiskScore, newApplication.status, newApplication.flags, 
      newApplication.createdAt, newApplication.updatedAt
    ];
    
    const result = await query(insertQuery, values);
    const savedApplication = dbRowToApplication(result.rows[0]);
    
    res.status(201).json(savedApplication);
  } catch (error) {
    console.error('Error creating loan application:', error);
    res.status(500).json({ error: 'Failed to create loan application' });
  }
});

// GET /api/loan-applications/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM loan_applications WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan application not found' });
    }
    
    const application = dbRowToApplication(result.rows[0]);
    res.json(application);
  } catch (error) {
    console.error('Failed to fetch loan application:', error);
    res.status(500).json({ error: 'Failed to fetch loan application' });
  }
});

// PUT /api/loan-applications/:id
router.put('/:id', async (req, res) => {
  try {
    const body = req.body;
    
    // Check if application exists
    const existingResult = await query('SELECT * FROM loan_applications WHERE id = $1', [req.params.id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan application not found' });
    }
    
    // Update application
    const updateQuery = `
      UPDATE loan_applications SET
        first_name = $2, last_name = $3, email = $4, phone = $5, date_of_birth = $6, ssn = $7,
        address = $8, city = $9, state = $10, zip_code = $11, employment_status = $12,
        employer_name = $13, job_title = $14, years_employed = $15, annual_income = $16,
        monthly_expenses = $17, existing_debts = $18, loan_amount = $19, loan_purpose = $20,
        loan_term = $21, documents = $22, accept_terms = $23, accept_privacy = $24,
        ai_risk_score = $25, status = $26, flags = $27, updated_at = $28
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      req.params.id, body.firstName, body.lastName, body.email, body.phone, body.dateOfBirth, body.ssn,
      body.address, body.city, body.state, body.zipCode, body.employmentStatus, body.employerName,
      body.jobTitle, body.yearsEmployed, body.annualIncome, body.monthlyExpenses, body.existingDebts,
      body.loanAmount, body.loanPurpose, body.loanTerm, body.documents, body.acceptTerms,
      body.acceptPrivacy, body.aiRiskScore, body.status, body.flags, new Date().toISOString()
    ];
    
    const result = await query(updateQuery, values);
    const updatedApplication = dbRowToApplication(result.rows[0]);
    
    res.json(updatedApplication);
  } catch (error) {
    console.error('Failed to update loan application:', error);
    res.status(500).json({ error: 'Failed to update loan application' });
  }
});

// DELETE /api/loan-applications/:id
router.delete('/:id', async (req, res) => {
  try {
    // Check if application exists
    const existingResult = await query('SELECT * FROM loan_applications WHERE id = $1', [req.params.id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan application not found' });
    }
    
    // Delete application
    await query('DELETE FROM loan_applications WHERE id = $1', [req.params.id]);
    const deletedApplication = dbRowToApplication(existingResult.rows[0]);
    
    res.json({ message: 'Loan application deleted successfully', application: deletedApplication });
  } catch (error) {
    console.error('Failed to delete loan application:', error);
    res.status(500).json({ error: 'Failed to delete loan application' });
  }
});

// PUT /api/loan-applications/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, flags } = req.body;
    
    if (!status || !['pending', 'under_review', 'approved', 'rejected', 'needs_more_info'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Check if application exists
    const existingResult = await query('SELECT * FROM loan_applications WHERE id = $1', [req.params.id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan application not found' });
    }
    
    // Update status and flags
    const updateQuery = `
      UPDATE loan_applications 
      SET status = $2, flags = $3, updated_at = $4 
      WHERE id = $1 
      RETURNING *
    `;
    
    const values = [
      req.params.id, 
      status, 
      JSON.stringify(flags || []), 
      new Date().toISOString()
    ];
    
    const result = await query(updateQuery, values);
    const updatedApplication = dbRowToApplication(result.rows[0]);
    
    res.json(updatedApplication);
  } catch (error) {
    console.error('Failed to update loan application status:', error);
    res.status(500).json({ error: 'Failed to update loan application status' });
  }
});

module.exports = router;
