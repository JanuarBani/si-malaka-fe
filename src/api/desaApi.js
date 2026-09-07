import axiosInstance from "./axios";

export const desaApi = {
  async getList(params = {}) {
    const response = await axiosInstance.get("/gis/desa/", { params });
    return response.data;
  },
  async create(data) {
    const response = await axiosInstance.post("/gis/desa/", data);
    return response.data;
  },
  async update(id, data) {
    const response = await axiosInstance.patch(`/gis/desa/${id}/`, data);
    return response.data;
  },
  async delete(id) {
    const response = await axiosInstance.delete(`/gis/desa/${id}/`);
    return response.data;
  },
};
