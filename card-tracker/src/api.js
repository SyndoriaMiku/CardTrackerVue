import axios from 'axios';
import { apiKey, clearApiKey } from './auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_CARD_API_URL || 'https://card-tracker-ly30.onrender.com/api'
});

// Only write requests need the key; GET stays public
api.interceptors.request.use((config) => {
    if (config.method !== 'get' && apiKey.value) {
        config.headers['X-Api-Key'] = apiKey.value;
    }
    return config;
});

// Wrong key: drop it so the UI asks again
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) clearApiKey();
        return Promise.reject(error);
    }
);

export default {
    getCards: (type, p, ps, search) => api.get('/cards', { params: { type, page: p, pageSize: ps, search } }),
    updateCard: (id, data) => api.put(`/cards/${id}`, data),
    addCard: (card) => api.post('/cards', card),
    addBulkCards: (cards) => api.post('/cards/bulk', cards)
};
