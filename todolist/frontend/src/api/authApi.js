import { apiRequest } from './apiRequest';

export const authApi = {
  login(payload) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  me() {
    return apiRequest('/api/auth/me', { method: 'GET' });
  },
};