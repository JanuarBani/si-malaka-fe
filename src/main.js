import "./style.css";
import router from "./router";

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  // Cegah browser menampilkan prompt otomatis
  e.preventDefault();
  deferredPrompt = e;
  // Tampilkan tombol install di pojok kanan bawah
  const installBtn = document.createElement("button");
  installBtn.textContent = "Install Aplikasi";
  installBtn.className =
    "fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
  installBtn.addEventListener("click", () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted install");
        }
        deferredPrompt = null;
        installBtn.remove();
      });
    }
  });
  document.body.appendChild(installBtn);
});

window.addEventListener("appinstalled", () => {
  console.log("Aplikasi berhasil diinstal");
  deferredPrompt = null;
});

document.addEventListener("DOMContentLoaded", () => {
  router.resolve();
});
