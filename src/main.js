import "./style.css";
import router from "./router";

let deferredPrompt;
let installBtn = null;
let hideTimeout = null;

function createInstallButton() {
  if (installBtn) return installBtn;

  installBtn = document.createElement("button");
  installBtn.innerHTML = `
    <span class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h3a1 1 0 110 2h-3v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h3V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      <span class="text-xs font-medium">Install</span>
    </span>
  `;
  installBtn.className =
    "fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-full shadow-md opacity-90 hover:opacity-100 transition-opacity flex items-center gap-1";
  installBtn.setAttribute("aria-label", "Install Aplikasi");
  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted install");
      }
      deferredPrompt = null;
      removeInstallButton();
    }
  });

  // Tambahkan tombol close kecil di dalamnya
  const closeSpan = document.createElement("span");
  closeSpan.innerHTML = "×";
  closeSpan.className =
    "ml-2 text-white/80 hover:text-white cursor-pointer text-sm leading-none";
  closeSpan.addEventListener("click", (e) => {
    e.stopPropagation();
    removeInstallButton();
  });
  installBtn.appendChild(closeSpan);

  document.body.appendChild(installBtn);
  return installBtn;
}

function removeInstallButton() {
  if (installBtn) {
    installBtn.remove();
    installBtn = null;
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  createInstallButton();

  // Sembunyikan otomatis setelah 15 detik jika tidak diklik
  hideTimeout = setTimeout(() => {
    if (installBtn && !installBtn.matches(":hover")) {
      removeInstallButton();
    }
  }, 15000);
});

window.addEventListener("appinstalled", () => {
  console.log("Aplikasi berhasil diinstal");
  deferredPrompt = null;
  removeInstallButton();
});

document.addEventListener("DOMContentLoaded", () => {
  router.resolve();
});
