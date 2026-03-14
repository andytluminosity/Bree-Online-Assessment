# Flask AI Risk Scoring Server

This document explains how to set up and run the Flask server that uses OpenAI API for loan risk assessment.

## Overview

The Flask server provides a dedicated AI service that:
- Analyzes loan applications using OpenAI's GPT-4
- Calculates risk scores (0-100) with detailed reasoning
- Provides risk flags and recommendations
- Integrates with the main loan application system

## Setup Instructions

### 1. Prerequisites

- Python 3.8 or higher
- OpenAI API key
- pip package manager

### 2. Install Dependencies

```bash
cd flask-server
pip install -r requirements.txt
```

### 3. Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your OpenAI API key:
```env
OPENAI_API_KEY=your_actual_openai_api_key_here
PORT=5000
DEBUG=False
```

### 4. Start the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check

**GET** `/health`

Check if the server is running:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "loan-risk-scoring",
  "version": "1.0.0"
}
```

### Risk Assessment

**POST** `/api/calculate-risk-score`

Calculate risk score for a loan application:

```bash
curl -X POST http://localhost:5000/api/calculate-risk-score \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

Response:
```json
{
  "riskScore": 25,
  "riskLevel": "low_risk",
  "flags": [],
  "reasoning": "Applicant has stable employment, good income-to-debt ratio, and reasonable loan request...",
  "recommendations": "Recommended for approval with standard terms."
}
```

## AI Risk Assessment Process

### 1. Data Analysis

The server analyzes:
- **Personal Information:** Identity verification, stability indicators
- **Employment Details:** Job stability, income consistency
- **Financial Data:** Income-to-debt ratios, loan affordability
- **Loan Details:** Purpose, amount relative to income

### 2. Calculated Ratios

- **Loan-to-Income Ratio:** `loan_amount / annual_income`
- **Debt-to-Income Ratio:** `(monthly_expenses + existing_debts/12) / (annual_income/12)`

### 3. Risk Scoring

**Score Range:** 0-100
- **0-30:** Low risk (excellent candidate)
- **31-60:** Medium risk (acceptable with conditions)
- **61-100:** High risk (requires additional review)

### 4. Risk Flags

The AI can assign these flags:
- `high_loan_to_income` - Loan amount exceeds 50% of annual income
- `unstable_employment` - Less than 1 year at current job
- `self_employed` - Self-employed applicants
- `high_debt_to_income` - Debt ratio above 40%
- `short_employment_history` - Limited work history
- `low_income` - Income below threshold
- `large_loan_amount` - Exceptionally large loan request
- `other` - Other risk factors identified

### 5. OpenAI Integration

**Model:** GPT-3.5-Turbo
**Temperature:** 0.3 (for consistent results)
**Max Tokens:** 500
**Prompt Engineering:** Structured for reliable parsing

## Integration with Main Application

### Frontend Integration

The loan application form:
1. Collects all borrower information
2. Sends data to Flask server for AI assessment
3. Receives risk score and analysis
4. Submits complete application to main API

### Data Flow

```
User Form → Flask Server (OpenAI) → Risk Assessment → Main API → Database
```

### Error Handling

- Network timeouts: 30 seconds
- API failures: Graceful fallback to default scoring
- Invalid responses: Default medium-risk assessment
- Missing fields: Detailed error messages

## Development

### Running in Development Mode

```bash
export DEBUG=True
python app.py
```

### Testing the Server

```python
# Test with sample data
import requests

test_data = {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    # ... other required fields
}

response = requests.post('http://localhost:5000/api/calculate-risk-score', json=test_data)
print(response.json())
```

### Monitoring

Check logs for:
- API call failures
- Response parsing errors
- Performance metrics
- Error rates

## Production Deployment

### Environment Variables

```env
OPENAI_API_KEY=your_production_key
PORT=5000
DEBUG=False
FLASK_CORS_ORIGINS=https://yourdomain.com
```

### Security Considerations

- **API Key Protection:** Never commit API keys to version control
- **Rate Limiting:** Implement client-side rate limiting
- **Input Validation:** Sanitize all incoming data
- **CORS:** Restrict to allowed origins only
- **Logging:** Monitor for abuse and unusual patterns

### Scaling

- **Horizontal Scaling:** Load balance multiple instances
- **Caching:** Cache similar assessments (with caution)
- **Queue System:** Handle high volume with task queues
- **Monitoring:** Track OpenAI API usage and costs

## Troubleshooting

### Common Issues

**Server won't start:**
- Check Python version (3.8+)
- Verify all dependencies installed
- Check environment variables

**OpenAI API errors:**
- Verify API key is valid
- Check API key permissions
- Monitor usage limits

**CORS errors:**
- Verify Flask CORS configuration
- Check frontend origin settings
- Ensure proper headers

**Timeout issues:**
- Increase timeout for large applications
- Check network connectivity
- Monitor OpenAI API response times

### Debug Mode

Enable debug logging:
```bash
export DEBUG=True
python app.py
```

### Health Monitoring

Regular health checks:
```bash
curl http://localhost:5000/health
```

## Cost Management

### OpenAI API Pricing

- **GPT-3.5-Turbo:** ~$0.002 per 1K input tokens
- **Typical request:** ~800 tokens
- **Cost per assessment:** ~$0.001-0.002

### Usage Tracking

Monitor:
- Number of assessments per day/week
- Average token usage
- Total API costs
- Error rates

### Optimization

- **Prompt Efficiency:** Minimize token usage
- **Caching:** Cache identical requests
- **Batch Processing:** Group multiple assessments
- **Model Selection:** Use appropriate model for needs

## Example Responses

### Low Risk Example
```json
{
  "riskScore": 15,
  "riskLevel": "low_risk",
  "flags": [],
  "reasoning": "Excellent candidate with stable employment, strong income, low debt-to-income ratio, and reasonable loan request.",
  "recommendations": "Approve with standard terms and conditions."
}
```

### High Risk Example
```json
{
  "riskScore": 85,
  "riskLevel": "high_risk",
  "flags": ["high_loan_to_income", "unstable_employment", "high_debt_to_income"],
  "reasoning": "High risk due to large loan amount relative to income, short employment history, and high existing debt burden.",
  "recommendations": "Require additional collateral, higher down payment, or reject application."
}
```

This Flask server provides intelligent, AI-driven risk assessment that enhances the loan application process with detailed analysis and recommendations.
