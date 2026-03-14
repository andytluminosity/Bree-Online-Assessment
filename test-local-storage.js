// Simple test for local storage functionality
// This can be run in browser console to test the implementation

// Mock the loanApplicationStorage functionality for testing
const testLocalStorage = () => {
  console.log('Testing Local Storage Implementation...')
  
  // Test 1: Check if storage is accessible
  try {
    localStorage.setItem('test', 'value')
    const value = localStorage.getItem('test')
    console.log('✓ Local storage is accessible:', value)
    localStorage.removeItem('test')
  } catch (error) {
    console.error('✗ Local storage not accessible:', error)
    return
  }

  // Test 2: Check if our storage key exists
  const storageKey = 'bree-loan-applications'
  const existingData = localStorage.getItem(storageKey)
  console.log('✓ Storage key check:', existingData ? 'Data exists' : 'No existing data')

  // Test 3: Create a sample application
  const sampleApp = {
    applicantName: 'Test User',
    email: 'test@example.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1990-01-01',
    ssn: '***-**-1234',
    address: '123 Test St',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    employmentStatus: 'Full-time',
    employerName: 'Test Corp',
    jobTitle: 'Tester',
    yearsEmployed: 5,
    annualIncome: 75000,
    monthlyExpenses: 3000,
    existingDebts: 10000,
    loanAmount: 25000,
    loanPurpose: 'Debt Consolidation',
    loanTerm: 36,
    status: 'submitted',
    riskScore: 75,
    recommendedAmount: 25000,
    interestRate: 8.5,
    monthlyPayment: 789.52,
    fraudFlags: [],
    documents: [{ name: 'Test Doc', status: 'pending' }]
  }

  // Test 4: Save application
  try {
    const applications = existingData ? JSON.parse(existingData) : []
    const newApp = {
      ...sampleApp,
      id: `LA-${new Date().getFullYear()}-${String(applications.length + 1).padStart(3, '0')}`,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    applications.push(newApp)
    localStorage.setItem(storageKey, JSON.stringify(applications))
    console.log('✓ Application saved successfully:', newApp.id)
  } catch (error) {
    console.error('✗ Failed to save application:', error)
  }

  // Test 5: Retrieve applications
  try {
    const retrieved = JSON.parse(localStorage.getItem(storageKey) || '[]')
    console.log('✓ Retrieved applications:', retrieved.length, 'applications')
    if (retrieved.length > 0) {
      console.log('Latest application:', retrieved[retrieved.length - 1].id)
    }
  } catch (error) {
    console.error('✗ Failed to retrieve applications:', error)
  }

  console.log('Local storage test completed!')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testLocalStorage = testLocalStorage
  console.log('Run testLocalStorage() in console to test local storage functionality')
}
