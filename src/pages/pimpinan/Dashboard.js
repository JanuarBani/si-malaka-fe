import L from "leaflet";
import { dashboardApi } from "../../api/dashboardApi";
import { kkprApi } from "../../api/kkprApi";
import { showToast } from "../../components/layout/Toast";
import { API_BASE_URL } from "../../utils/constants";

export default function PimpinanDashboard(user) {
  return `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">Dashboard Pimpinan</h2>
      <div id="pimpinan-stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-5">Loading...</div>
      </div>
      <!-- KPI Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">KPI</h3>
        <div id="kpi-container" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <p class="text-gray-500">Memuat KPI...</p>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold mb-4">Peta Persebaran KKPR</h3>
          <div id="pimpinan-map" class="w-full h-80 rounded-md border"></div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold mb-4">Ringkasan Verifikasi</h3>
          <div id="verification-summary" class="space-y-2">
            <p class="text-gray-500">Memuat ringkasan...</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initPimpinanDashboard(user) {
  const load = async () => {
    try {
      const s = await dashboardApi.getPimpinanSummary();
      // Tampilkan kartu statistik
      const cards = [
        {
          title: "Total KKPR",
          value: s.total_kkpr,
          icon: "📁",
          color: "bg-blue-500",
        },
        {
          title: "Total Sesuai",
          value: s.total_sesuai,
          icon: "👍",
          color: "bg-green-500",
        },
        {
          title: "Total Tidak Sesuai",
          value: s.total_tidak_sesuai,
          icon: "👎",
          color: "bg-red-500",
        },
        {
          title: "Menunggu Verifikasi",
          value: s.menunggu_verifikasi,
          icon: "⏳",
          color: "bg-yellow-500",
        },
        {
          title: "Sudah Terpetakan",
          value: s.sudah_terpetakan,
          icon: "🗺️",
          color: "bg-purple-500",
        },
        {
          title: "Jumlah Kecamatan",
          value: s.jumlah_kecamatan,
          icon: "🏙️",
          color: "bg-indigo-500",
        },
        {
          title: "Jumlah Desa",
          value: s.jumlah_desa,
          icon: "🏘️",
          color: "bg-pink-500",
        },
        {
          title: "Total Pemetaan",
          value: s.total_pemetaan,
          icon: "📐",
          color: "bg-orange-500",
        },
      ];
      document.getElementById("pimpinan-stats").innerHTML = cards
        .map(
          (c) => `
          <div class="bg-white rounded-lg shadow p-5">
            <p class="text-sm text-gray-500">${c.title}</p>
            <p class="text-2xl font-bold">${c.value}</p>
          </div>
        `,
        )
        .join("");

      // Hitung KPI
      const total = s.total_kkpr || 1;
      const persenSesuai = ((s.total_sesuai / total) * 100).toFixed(1);
      const persenTidakSesuai = ((s.total_tidak_sesuai / total) * 100).toFixed(
        1,
      );
      const persenTerpetakan = ((s.sudah_terpetakan / total) * 100).toFixed(1);
      const persenMenunggu = ((s.menunggu_verifikasi / total) * 100).toFixed(1);

      const kpiContainer = document.getElementById("kpi-container");
      kpiContainer.innerHTML = `
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm font-medium text-gray-700">Kesesuaian KKPR</p>
          <p class="text-2xl font-bold text-green-600">${persenSesuai}%</p>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-green-500 h-2 rounded-full" style="width: ${persenSesuai}%"></div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm font-medium text-gray-700">Tidak Sesuai</p>
          <p class="text-2xl font-bold text-red-600">${persenTidakSesuai}%</p>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-red-500 h-2 rounded-full" style="width: ${persenTidakSesuai}%"></div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm font-medium text-gray-700">Sudah Terpetakan</p>
          <p class="text-2xl font-bold text-blue-600">${persenTerpetakan}%</p>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-blue-500 h-2 rounded-full" style="width: ${persenTerpetakan}%"></div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg md:col-span-3">
          <p class="text-sm font-medium text-gray-700">Menunggu Verifikasi</p>
          <p class="text-2xl font-bold text-yellow-600">${persenMenunggu}%</p>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-yellow-500 h-2 rounded-full" style="width: ${persenMenunggu}%"></div>
          </div>
        </div>
      `;

      const lainnya =
        s.total_kkpr -
        (s.total_sesuai +
          s.total_tidak_sesuai +
          s.menunggu_verifikasi +
          s.sudah_terpetakan);

      document.getElementById("verification-summary").innerHTML = `
        <p><span class="font-medium">Sesuai:</span> ${s.total_sesuai} KKPR (${persenSesuai}%)</p>
        <p><span class="font-medium">Tidak Sesuai:</span> ${s.total_tidak_sesuai} KKPR (${persenTidakSesuai}%)</p>
        <p><span class="font-medium">Menunggu Verifikasi:</span> ${s.menunggu_verifikasi} KKPR (${persenMenunggu}%)</p>
        <p><span class="font-medium">Terpetakan:</span> ${s.sudah_terpetakan} KKPR (${persenTerpetakan}%)</p>
        ${lainnya > 0 ? `<p><span class="font-medium">Lainnya:</span> ${lainnya} KKPR</p>` : ""}
        <p><span class="font-medium">Total KKPR:</span> ${s.total_kkpr}</p>
      `;

      initMap();
    } catch (error) {
      console.error(error);
      document.getElementById("pimpinan-stats").innerHTML =
        '<div class="col-span-full text-red-500">Gagal memuat data dashboard.</div>';
      showToast("Gagal memuat data dashboard", "error");
    }
  };

  function initMap() {
    const mapElement = document.getElementById("pimpinan-map");
    if (!mapElement || mapElement._leaflet_id) return;
    const map = L.map(mapElement).setView([-9.5, 124.8], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    // Gunakan API_BASE_URL agar tidak relatif
    fetch(`${API_BASE_URL}/kkpr/kkpr/geojson/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat GeoJSON KKPR");
        return res.json();
      })
      .then((geojson) => {
        L.geoJSON(geojson, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: "#007bff",
              color: "#fff",
              weight: 1,
              fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const p = feature.properties;
              let popup = `<strong>${p.no_kkpr}</strong><br>`;
              popup += `Kegiatan: ${p.nama_kegiatan}<br>`;
              popup += `Pemohon: ${p.pemohon}<br>`;
              popup += `Kecamatan: ${p.kecamatan || "-"}<br>`;
              popup += `Status: ${p.workflow}`;
              layer.bindPopup(popup);
            }
          },
        }).addTo(map);
      })
      .catch((err) => console.error(err));
  }

  load();
}
