import axiosInstance from "./axios";

export const verifikasiApi = {
  async create(data) {
    const response = await axiosInstance.post("/kkpr/verifikasi/", data);
    return response.data;
  },

  async getList(params = {}) {
    const response = await axiosInstance.get("/kkpr/verifikasi/", { params });
    return response.data;
  },
};
