import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ========== FORMS API ==========
export const formsApi = {
  // Get all forms
  getAll: () => api.get('/forms'),
  
  // Get single form
  getById: (id) => api.get(`/forms/${id}`),
  
  // Create form
  create: (formData) => api.post('/forms', formData),
  
  // Update form
  update: (id, formData) => api.put(`/forms/${id}`, formData),
  
  // Delete form
  delete: (id) => api.delete(`/forms/${id}`),
};

// ========== CONTACTS API ==========
export const contactsApi = {
  // Get all contacts
  getAll: () => api.get('/contacts'),
  
  // Get single contact
  getById: (id) => api.get(`/contacts/${id}`),
  
  // Create contact
  create: (contactData) => api.post('/contacts', contactData),
  
  // Update contact
  update: (id, contactData) => api.put(`/contacts/${id}`, contactData),
  
  // Delete contact
  delete: (id) => api.delete(`/contacts/${id}`),
  
  // Generate form link
  generateLink: (contactId, formId) => api.post(`/generate-link/${contactId}/${formId}`),
};

// ========== RESPONSES API ==========
export const responsesApi = {
  // Get all responses with optional filters
  getAll: (params = {}) => api.get('/responses', { params }),
  
  // Import CSV responses
  importCsv: (formId, csvFile) => {
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    return api.post(`/responses/import/${formId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete response
  delete: (id) => api.delete(`/responses/${id}`),
};

// ========== SETTINGS API ==========
export const settingsApi = {
  // Get settings
  get: () => api.get('/settings'),
  
  // Update settings
  update: (settingsData) => api.put('/settings', settingsData),
};

// ========== STATS API ==========
export const statsApi = {
  // Get dashboard stats
  get: () => api.get('/stats'),
};

// ========== UTILITY FUNCTIONS ==========
export const utils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return error.response.data.error || 'Server error occurred';
    } else if (error.request) {
      // Request was made but no response received
      return 'Network error - please check your connection';
    } else {
      // Something else happened
      return error.message || 'An unexpected error occurred';
    }
  },
  
  // Format phone number for WhatsApp
  formatPhoneForWhatsApp: (phone) => {
    return phone.replace(/\D/g, '');
  },
  
  // Validate email
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // Validate phone number
  validatePhone: (phone) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\D/g, ''));
  },
  
  // Format date for display
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Format date for form inputs
  formatDateForInput: (date) => {
    return new Date(date).toISOString().slice(0, 16);
  },
  
  // Truncate text
  truncateText: (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  },
  
  // Generate initials from name
  getInitials: (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  },
};

export default api;