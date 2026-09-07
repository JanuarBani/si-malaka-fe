import axiosInstance from './axios';

export const userApi = {
  async getList(params = {}) {
    const response = await axiosInstance.get('/users/', { params });
    return response.data;
  },
  async getDetail(id) {
    const response = await axiosInstance.get(`/users/${id}/`);
    return response.data;
  },
  async create(data) {
    const response = await axiosInstance.post('/users/', data);
    return response.data;
  },
  async update(id, data) {
    const response = await axiosInstance.patch(`/users/${id}/`, data);
    return response.data;
  },
  async delete(id) {
    const response = await axiosInstance.delete(`/users/${id}/`);
    return response.data;
  },
};