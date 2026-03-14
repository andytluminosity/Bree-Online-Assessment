from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

if not openai.api_key:
    logger.error("OPENAI_API_KEY environment variable is not set")
    raise ValueError("OPENAI_API_KEY environment variable is not set")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'loan-risk-scoring',
        'version': '1.0.0'
    })

@app.route('/api/calculate-risk-score', methods=['POST'])
def calculate_risk_score():
    """
    Calculate loan risk score using OpenAI API
    
    Expected payload:
    {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "(555) 123-4567",
        "dateOfBirth": "1990-01-01",
        "ssn": "123-45-6789",
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102",
        "employmentStatus": "full-time",
        "employerName": "Tech Company",
        "jobTitle": "Software Engineer",
        "yearsEmployed": "5",
        "annualIncome": "75000",
        "monthlyExpenses": "3500",
        "existingDebts": "15000",
        "loanAmount": "50000",
        "loanPurpose": "debt-consolidation",
        "loanTerm": "36",
        "documents": ["id.pdf", "paystub.pdf"],
        "acceptTerms": true,
        "acceptPrivacy": true
    }
    """
    
    try:
        # Get loan application data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = [
            'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'ssn',
            'address', 'city', 'state', 'zipCode', 'employmentStatus',
            'employerName', 'jobTitle', 'yearsEmployed', 'annualIncome',
            'monthlyExpenses', 'existingDebts', 'loanAmount', 'loanPurpose',
            'loanTerm', 'acceptTerms', 'acceptPrivacy'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Prepare the prompt for OpenAI
        prompt = create_risk_assessment_prompt(data)
        
        # Call OpenAI API
        logger.info("Calling OpenAI API for risk assessment")
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional loan risk assessment expert. Analyze loan applications and provide detailed risk assessments with specific scores and reasoning."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Lower temperature for more consistent results
            max_tokens=500
        )
        
        # Parse the response
        risk_assessment = parse_openai_response(response.choices[0].message.content)
        
        logger.info(f"Risk assessment completed: Score {risk_assessment['riskScore']}")
        
        return jsonify(risk_assessment)
        
    except Exception as e:
        logger.error(f"Error calculating risk score: {str(e)}")
        return jsonify({'error': 'Failed to calculate risk score'}), 500

def create_risk_assessment_prompt(data):
    """Create a detailed prompt for OpenAI risk assessment"""
    
    # Calculate some financial ratios for context
    try:
        annual_income = float(data.get('annualIncome', 0))
        loan_amount = float(data.get('loanAmount', 0))
        monthly_expenses = float(data.get('monthlyExpenses', 0))
        existing_debts = float(data.get('existingDebts', 0))
        years_employed = float(data.get('yearsEmployed', 0))
        
        loan_to_income_ratio = loan_amount / annual_income if annual_income > 0 else 0
        monthly_income = annual_income / 12
        debt_to_income_ratio = (monthly_expenses + (existing_debts / 12)) / monthly_income if monthly_income > 0 else 0
        
    except (ValueError, TypeError):
        loan_to_income_ratio = 0
        debt_to_income_ratio = 0
    
    prompt = f"""
Please analyze the following loan application and provide a comprehensive risk assessment:

APPLICANT INFORMATION:
- Name: {data['firstName']} {data['lastName']}
- Email: {data['email']}
- Phone: {data['phone']}
- Date of Birth: {data['dateOfBirth']}
- Address: {data['address']}, {data['city']}, {data['state']} {data['zipCode']}

EMPLOYMENT DETAILS:
- Employment Status: {data['employmentStatus']}
- Employer: {data['employerName']}
- Job Title: {data['jobTitle']}
- Years at Current Job: {data['yearsEmployed']}
- Annual Income: ${data['annualIncome']}

FINANCIAL INFORMATION:
- Monthly Expenses: ${data['monthlyExpenses']}
- Existing Debts: ${data['existingDebts']}
- Loan Amount Requested: ${data['loanAmount']}
- Loan Purpose: {data['loanPurpose']}
- Loan Term: {data['loanTerm']} months

CALCULATED RATIOS:
- Loan-to-Income Ratio: {loan_to_income_ratio:.2f} (loan amount / annual income)
- Debt-to-Income Ratio: {debt_to_income_ratio:.2f} (total monthly debt payments / monthly income)

Please provide:
1. A risk score from 0-100 (where 0 is lowest risk and 100 is highest risk)
2. Risk level classification (low_risk, medium_risk, or high_risk)
3. Specific risk flags that apply (choose from: high_loan_to_income, unstable_employment, self_employed, high_debt_to_income, short_employment_history, low_income, large_loan_amount, other)
4. Detailed reasoning for the risk assessment
5. Recommendations for loan approval

Format your response exactly as follows:
RISK_SCORE: [score]
RISK_LEVEL: [low_risk/medium_risk/high_risk]
RISK_FLAGS: [flag1,flag2,flag3]
REASONING: [detailed explanation]
RECOMMENDATIONS: [approval recommendations]
"""
    
    return prompt

def parse_openai_response(response_content):
    """Parse OpenAI response into structured data"""
    
    try:
        lines = response_content.strip().split('\n')
        result = {
            'riskScore': 50,  # Default score
            'riskLevel': 'medium_risk',
            'flags': [],
            'reasoning': '',
            'recommendations': ''
        }
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('RISK_SCORE:'):
                try:
                    result['riskScore'] = int(line.split(':')[1].strip())
                except (ValueError, IndexError):
                    result['riskScore'] = 50
                    
            elif line.startswith('RISK_LEVEL:'):
                result['riskLevel'] = line.split(':')[1].strip().lower()
                
            elif line.startswith('RISK_FLAGS:'):
                flags_str = line.split(':')[1].strip()
                if flags_str and flags_str != 'none':
                    result['flags'] = [flag.strip() for flag in flags_str.split(',')]
                    
            elif line.startswith('REASONING:'):
                result['reasoning'] = line.split(':', 1)[1].strip()
                
            elif line.startswith('RECOMMENDATIONS:'):
                result['recommendations'] = line.split(':', 1)[1].strip()
        
        # Validate and sanitize the results
        result['riskScore'] = max(0, min(100, result['riskScore']))
        
        if result['riskLevel'] not in ['low_risk', 'medium_risk', 'high_risk']:
            # Determine risk level based on score if not provided
            if result['riskScore'] >= 70:
                result['riskLevel'] = 'low_risk'
            elif result['riskScore'] >= 40:
                result['riskLevel'] = 'medium_risk'
            else:
                result['riskLevel'] = 'high_risk'
        
        # Validate flags
        valid_flags = [
            'high_loan_to_income', 'unstable_employment', 'self_employed',
            'high_debt_to_income', 'short_employment_history', 'low_income',
            'large_loan_amount', 'other'
        ]
        result['flags'] = [flag for flag in result['flags'] if flag in valid_flags]
        
        return result
        
    except Exception as e:
        logger.error(f"Error parsing OpenAI response: {str(e)}")
        # Return default values if parsing fails
        return {
            'riskScore': 50,
            'riskLevel': 'medium_risk',
            'flags': ['other'],
            'reasoning': 'Unable to parse AI response. Manual review required.',
            'recommendations': 'Requires manual underwriting review.'
        }

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
