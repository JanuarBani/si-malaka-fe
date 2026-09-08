import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { zonasiApi } from "../../api/zonasiApi";
import { showToast } from "../../components/layout/Toast";
import axiosInstance from "../../api/axios";

export default function ZonasiList(user) {
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Manajemen Zonasi</h2>
        <button id="btn-add-zonasi" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Tambah Zonasi</button>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Zonasi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warna</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody id="zonasi-tbody">
            <tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Tambah/Edit -->
      <div id="modal-zonasi" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 id="modal-title" class="text-lg font-semibold">Tambah Zonasi</h3>
            <button id="btn-close-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <form id="zonasi-form" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Kode Zonasi</label>
                <input type="text" name="kode_zonasi" required class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nama Zonasi</label>
                <input type="text" name="nama_zonasi" required class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Warna</label>
                <input type="color" name="warna" value="#3388ff" class="mt-1 block w-full h-10 border rounded-md px-1 py-1">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea name="deskripsi" rows="2" class="mt-1 block w-full border rounded-md px-3 py-2"></textarea>
              </div>
            </div>
            <input type="hidden" name="geometry" id="zonasi-geometry" value="">
            <div class="space-y-2">
              <div class="flex gap-2">
                <button type="button" id="btn-draw-polygon" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Gambar Polygon</button>
                <button type="button" id="btn-clear-geometry" class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Hapus Geometry</button>
                <label class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm cursor-pointer">
                  Upload GeoJSON
                  <input type="file" id="file-geojson" accept=".geojson,.json" class="hidden">
                </label>
              </div>
              <div id="map-zonasi" class="w-full h-64 rounded-md border"></div>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" id="btn-cancel-zonasi" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Detail -->
      <div id="modal-detail" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Detail Zonasi</h3>
            <button id="btn-close-detail" class="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <div id="detail-content" class="space-y-4">
            <!-- Diisi oleh JavaScript -->
          </div>
          <div class="mt-4 flex justify-end">
            <button id="btn-detail-close" class="px-4 py-2 bg-gray-600 text-white rounded-md">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initZonasiList(user) {
  let map = null;
  let drawnLayer = null;
  let editingId = null;
  let detailMap = null;
  let detailLayer = null;

    async function loadDesaLayer(map) {
      try {
        const res = await axiosInstance.get("/gis/desa/geojson/");
        L.geoJSON(res.data, {
          style: { color: "#6c757d", weight: 1, fillOpacity: 0.02 },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`<strong>Desa: ${p.nama || "-"}</strong>`);
          },
        }).addTo(map);
      } catch (error) {
        console.error("Gagal memuat layer desa:", error);
      }
    }

  // Inisialisasi peta di dalam modal tambah/edit
  function initMap() {
    const mapElement = document.getElementById("map-zonasi");
    if (!mapElement) return;
    if (mapElement._leaflet_id) {
      // Jika sudah ada, bersihkan layer sebelumnya
      if (drawnLayer) {
        map.removeLayer(drawnLayer);
        drawnLayer = null;
      }
      return;
    }
    map = L.map(mapElement).setView([-9.5, 124.8], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    // Muat layer desa untuk referensi
    loadDesaLayer(map);

    map.on(L.Draw.Event.CREATED, (event) => {
      if (drawnLayer) map.removeLayer(drawnLayer);
      drawnLayer = event.layer;
      map.addLayer(drawnLayer);
      document.getElementById("zonasi-geometry").value = JSON.stringify(
        drawnLayer.toGeoJSON().geometry,
      );
    });

    document
      .getElementById("btn-draw-polygon")
      ?.addEventListener("click", () => {
        if (map) new L.Draw.Polygon(map).enable();
      });

    document
      .getElementById("btn-clear-geometry")
      ?.addEventListener("click", () => {
        if (drawnLayer) {
          map.removeLayer(drawnLayer);
          drawnLayer = null;
        }
        document.getElementById("zonasi-geometry").value = "";
      });

    document.getElementById("file-geojson")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const geojson = JSON.parse(ev.target.result);
          let geometry = null;
          if (
            geojson.type === "FeatureCollection" &&
            geojson.features.length > 0
          ) {
            geometry = geojson.features[0].geometry;
          } else if (geojson.type === "Feature") {
            geometry = geojson.geometry;
          } else {
            geometry = geojson;
          }
          if (map && geometry) {
            if (drawnLayer) map.removeLayer(drawnLayer);
            drawnLayer = L.geoJSON(geometry).addTo(map);
            document.getElementById("zonasi-geometry").value =
              JSON.stringify(geometry);
            const bounds = drawnLayer.getBounds();
            if (bounds.isValid()) map.fitBounds(bounds);
          }
          showToast("GeoJSON berhasil dimuat", "success");
        } catch (err) {
          showToast("Gagal membaca GeoJSON: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    });
  }

  // Muat daftar zonasi
  async function loadData() {
    const tbody = document.getElementById("zonasi-tbody");
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>';
    try {
      const data = await zonasiApi.getList({ page_size: 100 });
      const results = data.results || data;
      if (results.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Belum ada zonasi.</td></tr>';
        return;
      }
      tbody.innerHTML = results
        .map(
          (z) => `
        <tr>
          <td class="px-4 py-3 text-sm">${z.kode_zonasi}</td>
          <td class="px-4 py-3 text-sm">${z.nama_zonasi}</td>
          <td class="px-4 py-3 text-sm"><span class="inline-block w-6 h-6 rounded" style="background: ${z.warna || "#3388ff"}"></span></td>
          <td class="px-4 py-3 text-sm">${z.deskripsi || "-"}</td>
          <td class="px-4 py-3 text-sm whitespace-nowrap">
            <button data-id="${z.id}" class="text-blue-600 hover:underline btn-detail">Detail</button>
            <button data-id="${z.id}" class="ml-2 text-green-600 hover:underline btn-edit">Edit</button>
            <button data-id="${z.id}" class="ml-2 text-red-600 hover:underline btn-delete">Hapus</button>
          </td>
        </tr>
      `,
        )
        .join("");

      // Event untuk tombol detail
      tbody.querySelectorAll(".btn-detail").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const zonasi = results.find((r) => r.id == id);
          if (zonasi) openDetailModal(zonasi);
        });
      });

      // Event edit dan hapus (tetap seperti sebelumnya)
      tbody.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const zonasi = results.find((r) => r.id == id);
          if (zonasi) openEditModal(zonasi);
        });
      });

      tbody.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Yakin ingin menghapus zonasi ini?")) {
            try {
              await zonasiApi.delete(id);
              showToast("Zonasi dihapus", "success");
              loadData();
            } catch (error) {
              showToast("Gagal menghapus zonasi", "error");
            }
          }
        });
      });
    } catch (error) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="px-4 py-6 text-center text-red-500">Gagal memuat data.</td></tr>';
      showToast("Gagal memuat zonasi", "error");
    }
  }

  function openModal() {
    const modal = document.getElementById("modal-zonasi");
    if (!modal) return;
    modal.classList.remove("hidden");
    document.getElementById("zonasi-form").reset();
    document.getElementById("zonasi-geometry").value = "";
    if (drawnLayer && map) map.removeLayer(drawnLayer);
    drawnLayer = null;
    editingId = null;
    document.getElementById("modal-title").textContent = "Tambah Zonasi";
    initMap();
  }

  function openEditModal(zonasi) {
    const modal = document.getElementById("modal-zonasi");
    if (!modal) return;
    modal.classList.remove("hidden");
    document.getElementById("modal-title").textContent = "Edit Zonasi";
    const form = document.getElementById("zonasi-form");
    form.kode_zonasi.value = zonasi.kode_zonasi;
    form.nama_zonasi.value = zonasi.nama_zonasi;
    form.warna.value = zonasi.warna || "#3388ff";
    form.deskripsi.value = zonasi.deskripsi || "";
    document.getElementById("zonasi-geometry").value = zonasi.geometry
      ? JSON.stringify(zonasi.geometry)
      : "";
    editingId = zonasi.id;
    initMap();
    // Setelah peta siap, tambahkan geometry jika ada
    if (zonasi.geometry && map) {
      setTimeout(() => {
        if (drawnLayer) map.removeLayer(drawnLayer);
        drawnLayer = L.geoJSON(zonasi.geometry).addTo(map);
        const bounds = drawnLayer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds);
      }, 100);
    }
  }

  function closeModal() {
    const modal = document.getElementById("modal-zonasi");
    if (modal) modal.classList.add("hidden");
    if (drawnLayer && map) {
      map.removeLayer(drawnLayer);
      drawnLayer = null;
    }
  }

  // Fungsi untuk membuka modal detail
  function openDetailModal(zonasi) {
    const modal = document.getElementById("modal-detail");
    if (!modal) return;
    modal.classList.remove("hidden");
    const content = document.getElementById("detail-content");
    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Kode Zonasi</p>
          <p class="font-medium">${zonasi.kode_zonasi}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Nama Zonasi</p>
          <p class="font-medium">${zonasi.nama_zonasi}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Warna</p>
          <p><span class="inline-block w-6 h-6 rounded" style="background: ${zonasi.warna || "#3388ff"}"></span> ${zonasi.warna || "-"}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Deskripsi</p>
          <p>${zonasi.deskripsi || "-"}</p>
        </div>
      </div>
      <div class="mt-4">
        <p class="text-sm font-medium mb-2">Lokasi Zonasi</p>
        <div id="map-detail-zonasi" class="w-full h-64 rounded-md border"></div>
      </div>
    `;
    // Inisialisasi peta detail
    initDetailMap(zonasi);
  }

  function initDetailMap(zonasi) {
    const mapElement = document.getElementById("map-detail-zonasi");
    if (!mapElement) return;
    // Hapus peta sebelumnya jika ada
    if (detailMap && detailLayer) {
      detailMap.removeLayer(detailLayer);
      detailLayer = null;
    }
    if (detailMap) {
      detailMap.remove();
      detailMap = null;
    }
    detailMap = L.map(mapElement).setView([-9.5, 124.8], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(detailMap);

    if (zonasi.geometry && zonasi.geometry.type) {
      detailLayer = L.geoJSON(zonasi.geometry, {
        style: { color: zonasi.warna || "#3388ff" },
      }).addTo(detailMap);
      const bounds = detailLayer.getBounds();
      if (bounds.isValid()) detailMap.fitBounds(bounds);
    }
  }

  // Event untuk menutup modal detail
  document.getElementById("btn-close-detail")?.addEventListener("click", () => {
    document.getElementById("modal-detail")?.classList.add("hidden");
  });
  document.getElementById("btn-detail-close")?.addEventListener("click", () => {
    document.getElementById("modal-detail")?.classList.add("hidden");
  });

  // Event listeners utama
  document
    .getElementById("btn-add-zonasi")
    ?.addEventListener("click", openModal);
  document
    .getElementById("btn-close-modal")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("btn-cancel-zonasi")
    ?.addEventListener("click", closeModal);

  document
    .getElementById("zonasi-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
        kode_zonasi: form.kode_zonasi.value,
        nama_zonasi: form.nama_zonasi.value,
        warna: form.warna.value,
        deskripsi: form.deskripsi.value,
        geometry: form.geometry.value ? JSON.parse(form.geometry.value) : null,
      };
      try {
        if (editingId) {
          await zonasiApi.update(editingId, payload);
          showToast("Zonasi diperbarui", "success");
        } else {
          await zonasiApi.create(payload);
          showToast("Zonasi ditambahkan", "success");
        }
        closeModal();
        loadData();
      } catch (error) {
        console.error(error);
        let message = "Gagal menyimpan zonasi";
        if (error.response?.data) message = JSON.stringify(error.response.data);
        showToast(message, "error");
      }
    });

  loadData();
}
