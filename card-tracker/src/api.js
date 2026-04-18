import axios from 'axios';

const api = axios.create({ baseURL: 'https://card-tracker-ly30.onrender.com/api' });

export default {
    getCards: (type, p, ps, search) => api.get('/cards', { params: { type, page: p, pageSize: ps, search } }),
    updateCard: (id, data) => api.put(`/cards/${id}`, data),
    addCard: (card) => api.post('/cards', card),
    addBulkCards: (cards) => api.post('/cards/bulk', cards)
};