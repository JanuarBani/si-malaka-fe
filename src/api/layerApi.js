import axiosInstance from "./axios";

export const layerApi = {
  async getList(params = {}) {
    const response = await axiosInstance.get("/gis/layers/", { params });
    return response.data;
  },

  // Untuk create/update dengan JSON (misal layer gambar)
  async create(data) {
    const response = await axiosInstance.post("/gis/layers/", data);
    return response.data;
  },
  async update(id, data) {
    const response = await axiosInstance.patch(`/gis/layers/${id}/`, data);
    return response.data;
  },

  // Untuk create/update dengan file (multipart)
  async createWithFile(formData) {
    const response = await axiosInstance.post("/gis/layers/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async updateWithFile(id, formData) {
    const response = await axiosInstance.patch(`/gis/layers/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/gis/layers/${id}/`);
    return response.data;
  },
};
