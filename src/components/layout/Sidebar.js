export default function Sidebar(user, activeMenu = "") {
  const role = user?.role || "ADMIN";
  // Definisikan menu untuk tiap role
  const menuItems = {
    ADMIN: [
      { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
      { label: "Data KKPR", path: "/kkpr", icon: "📁" },
      { label: "Tambah KKPR", path: "/kkpr/tambah", icon: "➕" },
      { label: "Dokumen", path: "/dokumen", icon: "📄" },
      { label: "Peta", path: "/map", icon: "🗺️" },
      { label: "Manajemen User", path: "/users", icon: "👥" },
      { label: "Zonasi", path: "/zonasi", icon: "🎨" },
      { label: "Kecamatan", path: "/kecamatan", icon: "🏙️" },
      { label: "Desa", path: "/desa", icon: "🏘️" },
      { label: "Statistik", path: "/statistik", icon: "📉" },
      { label: "Laporan", path: "/laporan", icon: "📑" },
    ],
    OPERATOR_GIS: [
      { label: "Dashboard", path: "/operator/dashboard", icon: "📊" },
      { label: "Data KKPR", path: "/kkpr", icon: "📁" },
      { label: "Verifikasi Spasial", path: "/gis/verification", icon: "✅" },
      // { label: "Pemetaan GIS", path: "/gis/mapping", icon: "🗺️" },
      // { label: "Layer GIS", path: "/gis/layers", icon: "📚" },
      { label: "Peta", path: "/map", icon: "🗺️" },
      { label: "Statistik", path: "/statistik", icon: "📉" },
      { label: "Laporan", path: "/laporan", icon: "📑" },
    ],
    PIMPINAN: [
      { label: "Dashboard", path: "/pimpinan/dashboard", icon: "📊" },
      { label: "Data KKPR", path: "/kkpr", icon: "📁" },
      { label: "Peta", path: "/map", icon: "🗺️" },
      { label: "Statistik", path: "/statistik", icon: "📉" },
      { label: "Laporan", path: "/laporan", icon: "📑" },
    ],
  };

  const menus = menuItems[role] || menuItems.ADMIN;

  const menuHtml = menus
    .map((item) => {
      const isActive =
        activeMenu === item.path
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-100";
      return `
      <a href="${item.path}" class="flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive} transition-colors">
        <span class="mr-3">${item.icon}</span>
        ${item.label}
      </a>
    `;
    })
    .join("");

  return `
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out">
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <span class="text-lg font-bold text-blue-600">SI-PETARUNG</span>
        <button id="close-sidebar" class="md:hidden text-gray-500 hover:text-gray-700">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <nav class="mt-4 px-2 space-y-1">
        ${menuHtml}
      </nav>
      <div class="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div class="flex items-center">
          <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
            ${user?.nama_lengkap?.charAt(0) || "U"}
          </div>
          <div class="ml-2">
            <p class="text-sm font-medium text-gray-700">${user?.nama_lengkap || "User"}</p>
            <p class="text-xs text-gray-500">${user?.jabatan || user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  `;
}
