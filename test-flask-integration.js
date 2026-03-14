// Test script to verify Flask server integration
const fetch = require('node-fetch');

// Test data for loan application
const testApplication = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "(555) 123-4567",
  dateOfBirth: "1990-01-01",
  ssn: "123-45-6789",
  address: "123 Main Street",
  city: "San Francisco",
  state: "CA",
  zipCode: "94102",
  employmentStatus: "full-time",
  employerName: "Tech Company Inc",
  jobTitle: "Software Engineer",
  yearsEmployed: "5",
  annualIncome: "75000",
  monthlyExpenses: "3500",
  existingDebts: "15000",
  loanAmount: "50000",
  loanPurpose: "debt-consolidation",
  loanTerm: "36",
  documents: ["id.pdf", "paystub.pdf"],
  acceptTerms: true,
  acceptPrivacy: true
};

async function testFlaskServer() {
  console.log('🧪 Testing Flask Server Integration...\n');
  
  try {
    // Test health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test risk assessment
    console.log('\n2️⃣ Testing risk assessment...');
    console.log('📤 Sending test application data...');
    
    const riskResponse = await fetch('http://localhost:5000/api/calculate-risk-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testApplication)
    });
    
    if (!riskResponse.ok) {
      throw new Error(`Risk assessment failed: ${riskResponse.status} ${riskResponse.statusText}`);
    }
    
    const riskData = await riskResponse.json();
    console.log('✅ Risk assessment result:');
    console.log('   📊 Risk Score:', riskData.riskScore);
    console.log('   🏷️  Risk Level:', riskData.riskLevel);
    console.log('   🚩 Risk Flags:', riskData.flags.join(', ') || 'None');
    console.log('   📝 Reasoning:', riskData.reasoning.substring(0, 100) + '...');
    console.log('   💡 Recommendations:', riskData.recommendations.substring(0, 100) + '...');
    
    // Test complete application submission
    console.log('\n3️⃣ Testing complete application submission...');
    const applicationData = {
      ...testApplication,
      aiRiskScore: riskData.riskScore,
      status: 'pending',
      flags: riskData.flags,
      aiReasoning: riskData.reasoning,
      aiRecommendations: riskData.recommendations,
    };
    
    console.log('📤 Submitting application with AI assessment...');
    
    const appResponse = await fetch('http://localhost:3000/api/loan-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData)
    });
    
    if (!appResponse.ok) {
      throw new Error(`Application submission failed: ${appResponse.status} ${appResponse.statusText}`);
    }
    
    const appData = await appResponse.json();
    console.log('✅ Application submitted successfully:');
    console.log('   🆔 Application ID:', appData.id);
    console.log('   📊 AI Risk Score:', appData.aiRiskScore);
    console.log('   📅 Created:', appData.createdAt);
    
    console.log('\n🎉 All tests passed! Flask server integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   • Make sure Flask server is running on port 5000');
    console.log('   • Make sure Next.js is running on port 3000');
    console.log('   • Check that OPENAI_API_KEY is set in Flask server');
    console.log('   • Verify network connectivity');
  }
}

// Run the test
testFlaskServer();
