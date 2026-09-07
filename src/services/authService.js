import { authApi } from "../api/authApi";
import { ROLE_PATHS } from "../utils/constants";
import { showToast } from "../components/layout/Toast";

export class AuthService {
  static getAccessToken() {
    return localStorage.getItem("access_token");
  }

  static getRefreshToken() {
    return localStorage.getItem("refresh_token");
  }

  static setTokens(access, refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }

  static clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  static setUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  static getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return !!this.getAccessToken();
  }

  static async loginAndRedirect(username, password) {
    try {
      const data = await authApi.login({ username, password });
      this.setTokens(data.access, data.refresh);
      const user = await authApi.me();
      this.setUser(user);
      showToast("Login berhasil", "success");
      const path = ROLE_PATHS[user.role] || "/";
      window.location.href = path;
    } catch (error) {
      console.error("Login error:", error);
      let message = "Terjadi kesalahan saat login";
      if (error.response?.status === 401)
        message = "Username atau password salah";
      else if (error.response?.status === 400) message = "Data tidak valid";
      else if (error.code === "ERR_NETWORK")
        message = "Tidak dapat terhubung ke server";
      showToast(message, "error");
      throw error;
    }
  }
}
