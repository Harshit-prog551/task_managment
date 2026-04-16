import api from './axiosInstance'

export const userApi = {
  getAll: () => api.get('/users'),

  getById: (id) => api.get(`/users/${id}`),

  update: (id, params) => api.put(`/users/${id}`, null, { params }),

  delete: (id) => api.delete(`/users/${id}`),
}
