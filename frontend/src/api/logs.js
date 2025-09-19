import API from './axios';

export const getLogs = (params) => API.get('/logs', { params });
