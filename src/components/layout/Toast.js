import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export function showToast(message, type = "success") {
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: colors[type] || "#3b82f6",
    stopOnFocus: true,
  }).showToast();
}
