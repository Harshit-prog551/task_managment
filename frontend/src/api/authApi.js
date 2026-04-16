import api from './axiosInstance'

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (email, password, role = 'USER') =>
    api.post('/auth/register', { email, password, role }),
}
