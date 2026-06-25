import api from './client';

export const authApi = {
  config: () => api.get('/config').then((r) => r.data),
  signup: (payload) => api.post('/auth/signup', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (payload) => api.put('/auth/me', payload).then((r) => r.data),
  listUsers: () => api.get('/auth/users').then((r) => r.data),
  updateUserPoints: (id, points) => api.put(`/auth/users/${id}/points`, { points }).then((r) => r.data)
};

export const categoryApi = {
  list: () => api.get('/categories').then((r) => r.data),
  create: (payload) => api.post('/categories', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`)
};

export const voucherApi = {
  list: (params) => api.get('/vouchers', { params }).then((r) => r.data),
  get: (id) => api.get(`/vouchers/${id}`).then((r) => r.data),
  create: (payload) => api.post('/vouchers', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/vouchers/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/vouchers/${id}`)
};

export const cartApi = {
  get: () => api.get('/cart').then((r) => r.data),
  add: (payload) => api.post('/cart', payload).then((r) => r.data),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }).then((r) => r.data),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart')
};

export const redeemApi = {
  cart: () => api.post('/redeem/cart').then((r) => r.data),
  voucher: (voucherId, quantity) => api.post(`/redeem/voucher/${voucherId}`, { quantity }).then((r) => r.data),
  history: () => api.get('/redeem/history').then((r) => r.data)
};

export const analyticsApi = {
  summary: () => api.get('/analytics/summary').then((r) => r.data)
};
