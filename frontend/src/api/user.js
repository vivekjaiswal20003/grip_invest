import API from './axios';

export const getProfile = () => API.get('/users/profile');

export const updateProfile = (profileData) => API.put('/users/profile', profileData);
