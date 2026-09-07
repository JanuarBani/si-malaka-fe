import { kkprApi } from "../../api/kkprApi";
import Chart from "chart.js/auto";
import { showToast } from "../../components/layout/Toast";

export default function Statistics(user) {
  return `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">Statistik</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stat-cards">
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold mb-4">KKPR per Kecamatan</h3>
          <div class="h-80">
            <canvas id="chart-kecamatan"></canvas>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold mb-4">KKPR per Status Workflow</h3>
          <div class="h-80">
            <canvas id="chart-workflow"></canvas>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-4">Statistik Berdasarkan Jenis Kegiatan</h3>
        <div class="h-64">
          <canvas id="chart-jenis"></canvas>
        </div>
      </div>
    </div>
  `;
}

export function initStatistics(user) {
  const loadData = async () => {
    try {
      const response = await kkprApi.getList({ page_size: 1000 });
      const results = response.results || [];
      const totalKKPR = results.length;

      const statSesuai = results.filter((r) => r.workflow === "SESUAI").length;
      const statTidakSesuai = results.filter(
        (r) => r.workflow === "TIDAK_SESUAI",
      ).length;
      const statMenunggu = results.filter(
        (r) => r.workflow === "MENUNGGU_VERIFIKASI",
      ).length;
      const statTerpetakan = results.filter(
        (r) => r.workflow === "TERPETAKAN",
      ).length;

      document.getElementById("stat-cards").innerHTML = `
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Total KKPR</p>
          <p class="text-2xl font-bold">${totalKKPR}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Sesuai</p>
          <p class="text-2xl font-bold text-green-600">${statSesuai}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Tidak Sesuai</p>
          <p class="text-2xl font-bold text-red-600">${statTidakSesuai}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Menunggu Verifikasi</p>
          <p class="text-2xl font-bold text-yellow-600">${statMenunggu}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Terpetakan</p>
          <p class="text-2xl font-bold text-blue-600">${statTerpetakan}</p>
        </div>
      `;

      const kecamatanCounts = {};
      results.forEach((r) => {
        const nama = r.kecamatan_nama || "Tidak diketahui";
        kecamatanCounts[nama] = (kecamatanCounts[nama] || 0) + 1;
      });
      const kecamatanLabels = Object.keys(kecamatanCounts);
      const kecamatanData = Object.values(kecamatanCounts);

      const workflowCounts = {
        DRAFT: 0,
        MENUNGGU_VERIFIKASI: 0,
        DALAM_VERIFIKASI: 0,
        SESUAI: 0,
        TIDAK_SESUAI: 0,
        TERPETAKAN: 0,
        SELESAI: 0,
      };
      results.forEach((r) => {
        workflowCounts[r.workflow] = (workflowCounts[r.workflow] || 0) + 1;
      });
      const workflowLabels = Object.keys(workflowCounts);
      const workflowData = workflowLabels.map((l) => workflowCounts[l]);

      const jenisCounts = {};
      results.forEach((r) => {
        const jenis = r.jenis_kegiatan || "Tidak diketahui";
        jenisCounts[jenis] = (jenisCounts[jenis] || 0) + 1;
      });
      const jenisLabels = Object.keys(jenisCounts);
      const jenisData = jenisLabels.map((l) => jenisCounts[l]);

      new Chart(document.getElementById("chart-kecamatan"), {
        type: "bar",
        data: {
          labels: kecamatanLabels,
          datasets: [
            {
              label: "Jumlah KKPR",
              data: kecamatanData,
              backgroundColor: "#3b82f6",
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });

      new Chart(document.getElementById("chart-workflow"), {
        type: "doughnut",
        data: {
          labels: workflowLabels,
          datasets: [
            {
              data: workflowData,
              backgroundColor: [
                "#6b7280",
                "#f59e0b",
                "#6366f1",
                "#10b981",
                "#ef4444",
                "#3b82f6",
                "#8b5cf6",
              ],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });

      new Chart(document.getElementById("chart-jenis"), {
        type: "bar",
        data: {
          labels: jenisLabels,
          datasets: [
            {
              label: "Jumlah",
              data: jenisData,
              backgroundColor: "#10b981",
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    } catch (error) {
      console.error(error);
      showToast("Gagal memuat data statistik", "error");
    }
  };

  loadData();
}
