import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ user, content, activeMenu = "" }) {
  const sidebarHtml = Sidebar(user, activeMenu);
  const topbarHtml = Topbar(user);

  return `
    <div class="min-h-screen bg-gray-100 flex">
      ${sidebarHtml}
      <div class="flex-1 flex flex-col min-w-0 md:ml-64">
        ${topbarHtml}
        <main class="flex-1 p-4 md:p-6 overflow-y-auto">
          ${content}
        </main>
      </div>
    </div>
  `;
}

// Menggunakan event delegation agar selalu berfungsi
export function attachLayoutEvents() {
  // Buka sidebar ketika tombol burger diklik
  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("#open-sidebar");
    if (openBtn) {
      const sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.classList.remove("-translate-x-full");
      }
    }

    const closeBtn = e.target.closest("#close-sidebar");
    if (closeBtn) {
      const sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.classList.add("-translate-x-full");
      }
    }

    // Klik di luar sidebar untuk menutup (mobile)
    if (window.innerWidth < 768) {
      const sidebar = document.getElementById("sidebar");
      if (
        sidebar &&
        !sidebar.contains(e.target) &&
        !e.target.closest("#open-sidebar")
      ) {
        sidebar.classList.add("-translate-x-full");
      }
    }
  });

  // Logout handler (tetap)
  document.addEventListener("click", (e) => {
    const logoutBtn = e.target.closest("#logout-btn");
    if (logoutBtn) {
      import("../../api/authApi").then(({ authApi }) => {
        authApi.logout();
      });
    }
  });
}
