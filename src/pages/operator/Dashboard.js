import StatCard from "../../components/cards/StatCard";
import { dashboardApi } from "../../api/dashboardApi";
import { kkprApi } from "../../api/kkprApi";
import { showToast } from "../../components/layout/Toast";
import { initDashboardMap } from "../../components/gis/DashboardMap";

export default function OperatorDashboard() {
  return `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">Dashboard Operator GIS</h2>
      <div id="operator-stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-5">Loading...</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-4">Peta Sebaran KKPR</h3>
        <div id="operator-map" class="w-full h-96 rounded-md border"></div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-4">Tugas Verifikasi</h3>
        <div id="verification-tasks" class="space-y-2">
          <p class="text-gray-500">Memuat tugas...</p>
        </div>
      </div>
    </div>
  `;
}

export function initOperatorDashboard(user) {
  const load = async () => {
    try {
      const s = await dashboardApi.getOperatorSummary();
      const cards = [
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
          color: "bg-green-500",
        },
        { title: "Sesuai", value: s.sesuai, icon: "👍", color: "bg-blue-500" },
        {
          title: "Tidak Sesuai",
          value: s.tidak_sesuai,
          icon: "👎",
          color: "bg-red-500",
        },
        {
          title: "Bersyarat",
          value: s.bersyarat,
          icon: "🔧",
          color: "bg-orange-500",
        },
        {
          title: "Total Pemetaan",
          value: s.total_pemetaan,
          icon: "🗺️",
          color: "bg-purple-500",
        },
        {
          title: "Total Layer GIS",
          value: s.total_layer_gis,
          icon: "📚",
          color: "bg-indigo-500",
        },
      ];
      document.getElementById("operator-stats").innerHTML = cards
        .map((c) => StatCard(c))
        .join("");
    } catch (error) {
      console.error(error);
      document.getElementById("operator-stats").innerHTML =
        '<div class="col-span-full text-red-500">Gagal memuat data dashboard.</div>';
    }
  };

  const loadVerificationTasks = async () => {
    const container = document.getElementById("verification-tasks");
    if (!container) return;
    try {
      const data = await kkprApi.getList({
        workflow: "MENUNGGU_VERIFIKASI",
        page_size: 5,
      });
      const results = data.results || data;
      if (results.length === 0) {
        container.innerHTML =
          '<p class="text-gray-500">Tidak ada tugas verifikasi saat ini.</p>';
        return;
      }
      container.innerHTML = results
        .map(
          (item) => `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div>
            <p class="text-sm font-medium">${item.no_kkpr} - ${item.nama_kegiatan}</p>
            <p class="text-xs text-gray-500">${item.pemohon} • ${item.kecamatan_nama || "-"}</p>
          </div>
          <a href="/gis/verification/${item.id}" class="text-blue-600 hover:underline text-sm">Verifikasi</a>
        </div>
      `,
        )
        .join("");
    } catch (error) {
      console.error(error);
      container.innerHTML =
        '<p class="text-red-500">Gagal memuat tugas verifikasi.</p>';
      showToast("Gagal memuat tugas verifikasi", "error");
    }
  };

  // Panggil kedua fungsi
  load();
  loadVerificationTasks();

  // Panggil peta
  initDashboardMap("operator-map", { showKecamatan: true });
}
