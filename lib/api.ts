// API configuration and utility functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Utility function for API calls
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Specific API functions
export const api = {
  // Loan applications
  getApplications: () => apiFetch('/loan-applications'),
  createApplication: (data: any) => apiFetch('/loan-applications', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getApplication: (id: string) => apiFetch(`/loan-applications/${id}`),
  updateApplication: (id: string, data: any) => apiFetch(`/loan-applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteApplication: (id: string) => apiFetch(`/loan-applications/${id}`, {
    method: 'DELETE',
  }),
  updateApplicationStatus: (id: string, data: { status: string; flags?: string[] }) => 
    apiFetch(`/loan-applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Loans
  getLoans: (params?: { status?: string; loanOfficerId?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.loanOfficerId) searchParams.append('loanOfficerId', params.loanOfficerId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return apiFetch(`/loans${query ? '?' + query : ''}`);
  },
  createLoan: (data: any) => apiFetch('/loans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getLoan: (id: string) => apiFetch(`/loans/${id}`),
  updateLoan: (id: string, data: any) => apiFetch(`/loans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteLoan: (id: string) => apiFetch(`/loans/${id}`, {
    method: 'DELETE',
  }),
  disburseLoan: (id: string, data: any) => apiFetch(`/loans/${id}/disburse`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export default api;
