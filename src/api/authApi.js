import axiosInstance from "./axios";

export const authApi = {
  async login(credentials) {
    const response = await axiosInstance.post("/auth/login/", credentials);
    return response.data;
  },

  async me() {
    const response = await axiosInstance.get("/auth/me/");
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      await axiosInstance.post("/auth/logout/", { refresh: refreshToken });
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },
};
