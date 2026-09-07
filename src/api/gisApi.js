import axiosInstance from "./axios";

export const pemetaanApi = {
  async getList(params = {}) {
    const response = await axiosInstance.get("/gis/pemetaan/", { params });
    return response.data;
  },
  async create(data) {
    const response = await axiosInstance.post("/gis/pemetaan/", data);
    return response.data;
  },
  async delete(id) {
    const response = await axiosInstance.delete(`/gis/pemetaan/${id}/`);
    return response.data;
  },
};
