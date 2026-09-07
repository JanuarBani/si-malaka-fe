import { dashboardApi } from "../../api/dashboardApi";
import { showToast } from "../../components/layout/Toast";
import { initDashboardMap } from "../../components/gis/DashboardMap";

export default function AdminDashboard() {
  return `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">Dashboard Admin</h2>
      <div id="admin-stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-5">Loading...</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-4">Peta Sebaran KKPR</h3>
        <div id="admin-map" class="w-full h-96 rounded-md border"></div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-4">Aktivitas Terbaru</h3>
        <div id="recent-activities" class="space-y-2">
          <p class="text-gray-500">Memuat aktivitas...</p>
        </div>
      </div>
    </div>
  `;
}

export function initAdminDashboard(user) {
  const loadSummary = async () => {
    try {
      const s = await dashboardApi.getAdminSummary();
      const cards = [
        {
          title: "Total KKPR",
          value: s.total_kkpr,
          icon: "📁",
          color: "bg-blue-500",
        },
        {
          title: "KKPR Baru",
          value: s.kkpr_baru,
          icon: "✨",
          color: "bg-green-500",
        },
        {
          title: "Menunggu Verifikasi",
          value: s.menunggu_verifikasi,
          icon: "⏳",
          color: "bg-yellow-500",
        },
        {
          title: "Sudah Diverifikasi",
          value: s.sudah_diverifikasi,
          icon: "✅",
          color: "bg-indigo-500",
        },
        { title: "Sesuai", value: s.sesuai, icon: "👍", color: "bg-green-500" },
        {
          title: "Tidak Sesuai",
          value: s.tidak_sesuai,
          icon: "👎",
          color: "bg-red-500",
        },
        {
          title: "Total Dokumen",
          value: s.total_dokumen,
          icon: "📄",
          color: "bg-purple-500",
        },
        {
          title: "Total Kecamatan",
          value: s.total_kecamatan,
          icon: "🏙️",
          color: "bg-orange-500",
        },
        {
          title: "Total Pemetaan",
          value: s.total_pemetaan,
          icon: "🗺️",
          color: "bg-pink-500",
        },
      ];
      document.getElementById("admin-stats").innerHTML = cards
        .map(
          (c) => `
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">${c.title}</p>
          <p class="text-2xl font-bold">${c.value}</p>
        </div>
      `,
        )
        .join("");
    } catch (error) {
      console.error(error);
      document.getElementById("admin-stats").innerHTML =
        '<div class="col-span-full text-red-500">Gagal memuat data dashboard.</div>';
      showToast("Gagal memuat data dashboard", "error");
    }
  };

  const loadActivities = async () => {
    const container = document.getElementById("recent-activities");
    if (!container) return;
    try {
      const activities = await dashboardApi.getAdminActivities();
      console.log("Aktivitas:", activities);
      let html = "";

      // KKPR terbaru
      if (activities.kkpr.length > 0) {
        html += activities.kkpr
          .map(
            (k) => `
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div>
              <p class="text-sm font-medium">${k.no_kkpr} - ${k.nama_kegiatan}</p>
              <p class="text-xs text-gray-500">${k.pemohon} • ${k.workflow} • ${new Date(k.created_at).toLocaleString("id-ID")}</p>
            </div>
            <a href="/kkpr/${k.id}" class="text-blue-600 hover:underline text-sm">Detail</a>
          </div>
        `,
          )
          .join("");
      } else {
        html += '<p class="text-gray-500">Belum ada KKPR.</p>';
      }

      // Audit log
      if (activities.audit && activities.audit.length > 0) {
        html += '<hr class="my-2">';
        html += activities.audit
          .map(
            (log) => `
          <div class="p-2 bg-gray-50 rounded">
            <p class="text-sm">${log.action} oleh ${log.user_nama || "-"} pada ${new Date(log.timestamp).toLocaleString("id-ID")}</p>
          </div>
        `,
          )
          .join("");
      }

      container.innerHTML = html;
    } catch (error) {
      console.error(error);
      container.innerHTML =
        '<p class="text-red-500">Gagal memuat aktivitas.</p>';
    }
  };

  // Jalankan keduanya secara paralel
  loadSummary();
  loadActivities();
  // Panggil peta
  initDashboardMap("admin-map", { showKecamatan: true });
}
