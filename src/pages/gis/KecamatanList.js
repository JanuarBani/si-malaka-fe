import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { kecamatanApi } from "../../api/kecamatanApi";
import { showToast } from "../../components/layout/Toast";

export default function KecamatanList(user) {
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Manajemen Kecamatan</h2>
        <button id="btn-add-kecamatan" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Tambah Kecamatan</button>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody id="kecamatan-tbody">
            <tr><td colspan="3" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Tambah/Edit -->
      <div id="modal-kecamatan" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 id="modal-title" class="text-lg font-semibold">Tambah Kecamatan</h3>
            <button id="btn-close-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <form id="kecamatan-form" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Kode</label>
                <input type="text" name="kode" required class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nama</label>
                <input type="text" name="nama" required class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
            </div>
            <input type="hidden" name="geometry" id="kecamatan-geometry" value="">
            <div class="space-y-2">
              <div class="flex gap-2">
                <button type="button" id="btn-draw-polygon" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Gambar Polygon</button>
                <button type="button" id="btn-clear-geometry" class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Hapus Geometry</button>
                <label class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm cursor-pointer">
                  Upload GeoJSON
                  <input type="file" id="file-geojson" accept=".geojson,.json" class="hidden">
                </label>
              </div>
              <div id="map-kecamatan" class="w-full h-64 rounded-md border"></div>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" id="btn-cancel-kecamatan" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Detail -->
      <div id="modal-detail" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Detail Kecamatan</h3>
            <button id="btn-close-detail" class="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <div id="detail-content" class="space-y-4"></div>
          <div class="mt-4 flex justify-end">
            <button id="btn-detail-close" class="px-4 py-2 bg-gray-600 text-white rounded-md">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initKecamatanList(user) {
  let map = null;
  let drawnLayer = null;
  let editingId = null;
  let detailMap = null;
  let detailLayer = null;

  function initMap() {
    const mapElement = document.getElementById("map-kecamatan");
    if (!mapElement) return;
    if (mapElement._leaflet_id) {
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

    map.on(L.Draw.Event.CREATED, (event) => {
      if (drawnLayer) map.removeLayer(drawnLayer);
      drawnLayer = event.layer;
      map.addLayer(drawnLayer);
      document.getElementById("kecamatan-geometry").value = JSON.stringify(
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
        document.getElementById("kecamatan-geometry").value = "";
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
            document.getElementById("kecamatan-geometry").value =
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

  async function loadData() {
    const tbody = document.getElementById("kecamatan-tbody");
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="3" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>';
    try {
      const data = await kecamatanApi.getList({ page_size: 100 });
      const results = data.results || data;
      if (results.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="3" class="px-4 py-6 text-center text-gray-500">Belum ada kecamatan.</td></tr>';
        return;
      }
      tbody.innerHTML = results
        .map(
          (k) => `
        <tr>
          <td class="px-4 py-3 text-sm">${k.kode}</td>
          <td class="px-4 py-3 text-sm">${k.nama}</td>
          <td class="px-4 py-3 text-sm whitespace-nowrap">
            <button data-id="${k.id}" class="text-blue-600 hover:underline btn-detail">Detail</button>
            <button data-id="${k.id}" class="ml-2 text-green-600 hover:underline btn-edit">Edit</button>
            <button data-id="${k.id}" class="ml-2 text-red-600 hover:underline btn-delete">Hapus</button>
          </td>
        </tr>
      `,
        )
        .join("");

      tbody.querySelectorAll(".btn-detail").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const kec = results.find((r) => r.id == id);
          if (kec) openDetailModal(kec);
        });
      });

      tbody.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const kec = results.find((r) => r.id == id);
          if (kec) openEditModal(kec);
        });
      });

      tbody.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Yakin ingin menghapus kecamatan ini?")) {
            try {
              await kecamatanApi.delete(id);
              showToast("Kecamatan dihapus", "success");
              loadData();
            } catch (error) {
              showToast("Gagal menghapus kecamatan", "error");
            }
          }
        });
      });
    } catch (error) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="px-4 py-6 text-center text-red-500">Gagal memuat data.</td></tr>';
      showToast("Gagal memuat kecamatan", "error");
    }
  }

  function openModal() {
    const modal = document.getElementById("modal-kecamatan");
    if (!modal) return;
    modal.classList.remove("hidden");
    document.getElementById("kecamatan-form").reset();
    document.getElementById("kecamatan-geometry").value = "";
    if (drawnLayer && map) map.removeLayer(drawnLayer);
    drawnLayer = null;
    editingId = null;
    document.getElementById("modal-title").textContent = "Tambah Kecamatan";
    initMap();
  }

  function openEditModal(kec) {
    const modal = document.getElementById("modal-kecamatan");
    if (!modal) return;
    modal.classList.remove("hidden");
    document.getElementById("modal-title").textContent = "Edit Kecamatan";
    const form = document.getElementById("kecamatan-form");
    form.kode.value = kec.kode;
    form.nama.value = kec.nama;
    document.getElementById("kecamatan-geometry").value = kec.geometry
      ? JSON.stringify(kec.geometry)
      : "";
    editingId = kec.id;
    initMap();
    if (kec.geometry && map) {
      setTimeout(() => {
        if (drawnLayer) map.removeLayer(drawnLayer);
        drawnLayer = L.geoJSON(kec.geometry).addTo(map);
        const bounds = drawnLayer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds);
      }, 100);
    }
  }

  function closeModal() {
    const modal = document.getElementById("modal-kecamatan");
    if (modal) modal.classList.add("hidden");
    if (drawnLayer && map) {
      map.removeLayer(drawnLayer);
      drawnLayer = null;
    }
  }

  function openDetailModal(kec) {
    const modal = document.getElementById("modal-detail");
    if (!modal) return;
    modal.classList.remove("hidden");
    const content = document.getElementById("detail-content");
    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Kode</p>
          <p class="font-medium">${kec.kode}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Nama</p>
          <p class="font-medium">${kec.nama}</p>
        </div>
      </div>
      <div class="mt-4">
        <p class="text-sm font-medium mb-2">Lokasi Kecamatan</p>
        <div id="map-detail-kecamatan" class="w-full h-64 rounded-md border"></div>
      </div>
    `;
    initDetailMap(kec);
  }

  function initDetailMap(kec) {
    const mapElement = document.getElementById("map-detail-kecamatan");
    if (!mapElement) return;
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

    if (kec.geometry && kec.geometry.type) {
      detailLayer = L.geoJSON(kec.geometry).addTo(detailMap);
      const bounds = detailLayer.getBounds();
      if (bounds.isValid()) detailMap.fitBounds(bounds);
    }
  }

  document.getElementById("btn-close-detail")?.addEventListener("click", () => {
    document.getElementById("modal-detail")?.classList.add("hidden");
  });
  document.getElementById("btn-detail-close")?.addEventListener("click", () => {
    document.getElementById("modal-detail")?.classList.add("hidden");
  });

  document
    .getElementById("btn-add-kecamatan")
    ?.addEventListener("click", openModal);
  document
    .getElementById("btn-close-modal")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("btn-cancel-kecamatan")
    ?.addEventListener("click", closeModal);

  document
    .getElementById("kecamatan-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
        kode: form.kode.value,
        nama: form.nama.value,
        geometry: form.geometry.value ? JSON.parse(form.geometry.value) : null,
      };
      try {
        if (editingId) {
          await kecamatanApi.update(editingId, payload);
          showToast("Kecamatan diperbarui", "success");
        } else {
          await kecamatanApi.create(payload);
          showToast("Kecamatan ditambahkan", "success");
        }
        closeModal();
        loadData();
      } catch (error) {
        console.error(error);
        let message = "Gagal menyimpan kecamatan";
        if (error.response?.data) message = JSON.stringify(error.response.data);
        showToast(message, "error");
      }
    });

  loadData();
}
