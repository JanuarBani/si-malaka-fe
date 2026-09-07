import axiosInstance from "./axios";

export const kecamatanApi = {
  async getList(params = {}) {
    const response = await axiosInstance.get("/gis/kecamatan/", { params });
    return response.data;
  },
  async create(data) {
    const response = await axiosInstance.post("/gis/kecamatan/", data);
    return response.data;
  },
  async update(id, data) {
    const response = await axiosInstance.patch(`/gis/kecamatan/${id}/`, data);
    return response.data;
  },
  async delete(id) {
    const response = await axiosInstance.delete(`/gis/kecamatan/${id}/`);
    return response.data;
  },
};
