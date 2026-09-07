import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { AuthService } from "../services/authService";
import router from "../router";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = AuthService.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          AuthService.setTokens(access, refreshToken);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          AuthService.clearTokens();
          router.navigate("/login");
          return Promise.reject(refreshError);
        }
      } else {
        AuthService.clearTokens();
        router.navigate("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
