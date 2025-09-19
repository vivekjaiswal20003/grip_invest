import API from './axios';

export const signup = (userData) => API.post('/auth/signup', userData);
export const login = (userData) => API.post('/auth/login', userData);
export const forgotPassword = (email) => API.post('/auth/forgot-password', email);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const checkPasswordStrength = (password) => API.post('/auth/password-strength', { password });
