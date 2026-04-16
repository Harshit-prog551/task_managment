import api from './axiosInstance'

export const taskApi = {
  getAll: (params) => api.get('/tasks', { params }),

  getById: (id) => api.get(`/tasks/${id}`),

  create: (data) => api.post('/tasks', data),

  update: (id, data) => api.put(`/tasks/${id}`, data),

  delete: (id) => api.delete(`/tasks/${id}`),

  uploadFiles: (taskId, files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return api.post(`/tasks/${taskId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteFile: (taskId, fileId) =>
    api.delete(`/tasks/${taskId}/files/${fileId}`),

  getFileDownloadUrl: (taskId, fileId) =>
    `/api/tasks/${taskId}/files/${fileId}/download`,
}
