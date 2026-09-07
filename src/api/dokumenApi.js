import axiosInstance from "./axios";

export const dokumenApi = {
  async getList(params = {}) {
    const response = await axiosInstance.get("/dokumen/", { params });
    return response.data;
  },
  async getDetail(id) {
    const response = await axiosInstance.get(`/dokumen/${id}/`);
    return response.data;
  },
  async create(formData) {
    const response = await axiosInstance.post("/dokumen/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async update(id, formData) {
    const response = await axiosInstance.patch(`/dokumen/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async delete(id) {
    const response = await axiosInstance.delete(`/dokumen/${id}/`);
    return response.data;
  },
};
