import axiosInstance from "./axios";

export const kkprApi = {
  async getList(params = {}) {
    const response = await axiosInstance.get("/kkpr/kkpr/", { params });
    return response.data;
  },

  async getDetail(id) {
    const response = await axiosInstance.get(`/kkpr/kkpr/${id}/`);
    return response.data;
  },

  async create(data) {
    const response = await axiosInstance.post("/kkpr/kkpr/", data);
    return response.data;
  },

  async update(id, data) {
    const response = await axiosInstance.patch(`/kkpr/kkpr/${id}/`, data);
    return response.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/kkpr/kkpr/${id}/`);
    return response.data;
  },

  async getKecamatan(params = {}) {
    // Default page_size besar agar semua data kecamatan terambil
    const response = await axiosInstance.get("/gis/kecamatan/", {
      params: { page_size: 100, ...params },
    });
    return response.data;
  },

  async getDesa(kecamatanId = null) {
    const params = kecamatanId
      ? { kecamatan: kecamatanId, page_size: 100 }
      : { page_size: 100 };
    const response = await axiosInstance.get("/gis/desa/", { params });
    return response.data;
  },

  async getZonasi(params = {}) {
    const response = await axiosInstance.get("/gis/zonasi/", {
      params: { page_size: 100, ...params },
    });
    return response.data;
  },
};
