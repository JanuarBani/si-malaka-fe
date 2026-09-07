import axiosInstance from "./axios";

export const zonasiApi = {
  async getList(params = {}) {
    const response = await axiosInstance.get("/gis/zonasi/", { params });
    return response.data;
  },
  async create(data) {
    const response = await axiosInstance.post("/gis/zonasi/", data);
    return response.data;
  },
  async update(id, data) {
    const response = await axiosInstance.patch(`/gis/zonasi/${id}/`, data);
    return response.data;
  },
  async delete(id) {
    const response = await axiosInstance.delete(`/gis/zonasi/${id}/`);
    return response.data;
  },
};
