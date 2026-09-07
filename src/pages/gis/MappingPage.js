import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { kkprApi } from "../../api/kkprApi";
import { pemetaanApi } from "../../api/gisApi";
import { showToast } from "../../components/layout/Toast";

export default function MappingPage(user) {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-800">Pemetaan GIS</h2>
      <div class="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700">Pilih KKPR</label>
          <select id="select-kkpr" class="mt-1 block w-full border rounded-md px-3 py-2">
            <option value="">Pilih KKPR</option>
          </select>
        </div>
        <button id="btn-load" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Muat Pemetaan</button>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <div id="map" class="w-full h-[500px] rounded-lg shadow-lg"></div>
        </div>
        <div class="space-y-4">
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-semibold mb-2">Alat Gambar</h3>
            <div class="flex flex-wrap gap-2">
              <button id="draw-point" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Point</button>
              <button id="draw-line" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Line</button>
              <button id="draw-polygon" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Polygon</button>
              <button id="clear-drawings" class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Bersihkan</button>
            </div>
            <p class="text-xs text-gray-500 mt-2">Klik tombol untuk mulai menggambar. Selesaikan dengan klik terakhir (untuk polygon/line double-click).</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-semibold mb-2">Geometry Pending</h3>
            <div id="pending-list" class="space-y-2">
              <p class="text-sm text-gray-500">Belum ada geometry digambar.</p>
            </div>
            <button id="btn-save-all" class="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md" disabled>Simpan Semua</button>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-semibold mb-2">Pemetaan Tersimpan</h3>
            <div id="saved-list" class="space-y-2">
              <p class="text-sm text-gray-500">Belum ada pemetaan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initMappingPage(user) {
  let map;
  let selectedKKPRId = null;
  let pendingGeometries = [];
  let savedLayers = [];

  function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement || mapElement._leaflet_id) return;
    map = L.map(mapElement).setView([-9.5, 124.8], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: { allowIntersection: false, showArea: true },
        polyline: { shapeOptions: { color: "#3388ff" } },
        circlemarker: false,
        circle: false,
        rectangle: false,
        marker: true,
      },
      edit: { featureGroup: new L.FeatureGroup() },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      const type = event.layerType;
      const geojson = layer.toGeoJSON();
      const geometryType =
        type === "marker"
          ? "POINT"
          : type === "polyline"
            ? "LINESTRING"
            : "POLYGON";
      layer.addTo(map);
      pendingGeometries.push({
        layer,
        geometry: geojson.geometry,
        geometry_type: geometryType,
        nama_layer: "",
        warna: "#3388ff",
        keterangan: "",
      });
      updatePendingList();
      updateSaveButton();
    });
  }

  async function loadKKPROptions() {
    const select = document.getElementById("select-kkpr");
    if (!select) {
      console.error("Elemen select-kkpr tidak ditemukan");
      return;
    }
    try {
      const data = await kkprApi.getList({ page_size: 100 });
      console.log("Data KKPR untuk dropdown:", data);

      // Tangani jika data adalah array langsung atau objek pagination
      let results;
      if (Array.isArray(data)) {
        results = data;
      } else if (data && Array.isArray(data.results)) {
        results = data.results;
      } else {
        results = [];
        console.error("Format data tidak dikenal:", data);
      }

      select.innerHTML = '<option value="">Pilih KKPR</option>';
      if (results.length === 0) {
        select.innerHTML = '<option value="">Tidak ada KKPR</option>';
        return;
      }
      results.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = `${item.no_kkpr} - ${item.nama_kegiatan}`;
        select.appendChild(opt);
      });
    } catch (error) {
      console.error("Gagal memuat daftar KKPR", error);
      showToast("Gagal memuat daftar KKPR", "error");
    }
  }

  async function loadSavedPemetaan() {
    savedLayers.forEach(({ layer }) => map.removeLayer(layer));
    savedLayers = [];
    document.getElementById("saved-list").innerHTML =
      '<p class="text-sm text-gray-500">Belum ada pemetaan.</p>';

    if (!selectedKKPRId) return;

    try {
      const data = await pemetaanApi.getList({ kkpr: selectedKKPRId });
      const results = data.results || data;
      const savedListDiv = document.getElementById("saved-list");
      if (results.length === 0) {
        savedListDiv.innerHTML =
          '<p class="text-sm text-gray-500">Tidak ada pemetaan tersimpan.</p>';
      } else {
        savedListDiv.innerHTML = results
          .map(
            (item) => `
          <div class="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div>
              <span class="text-sm font-medium">${item.nama_layer}</span>
              <span class="text-xs text-gray-500">(${item.geometry_type})</span>
            </div>
            <button data-id="${item.id}" class="text-red-600 hover:underline text-sm btn-delete-saved">Hapus</button>
          </div>
        `,
          )
          .join("");
        results.forEach((item) => {
          const geojsonLayer = L.geoJSON(item.geometry, {
            style: { color: item.warna || "#3388ff" },
          }).addTo(map);
          savedLayers.push({
            id: item.id,
            layer: geojsonLayer,
            nama_layer: item.nama_layer,
          });
          geojsonLayer.bindPopup(
            `<strong>${item.nama_layer}</strong><br>${item.keterangan || ""}`,
          );
        });
        savedListDiv.querySelectorAll(".btn-delete-saved").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            if (confirm("Hapus pemetaan ini?")) {
              try {
                await pemetaanApi.delete(id);
                showToast("Pemetaan dihapus", "success");
                loadSavedPemetaan();
              } catch (err) {
                showToast("Gagal menghapus pemetaan", "error");
              }
            }
          });
        });
      }
    } catch (error) {
      showToast("Gagal memuat pemetaan tersimpan", "error");
    }
  }

  function updatePendingList() {
    const pendingDiv = document.getElementById("pending-list");
    if (pendingGeometries.length === 0) {
      pendingDiv.innerHTML =
        '<p class="text-sm text-gray-500">Belum ada geometry digambar.</p>';
      return;
    }
    pendingDiv.innerHTML = pendingGeometries
      .map(
        (item, index) => `
      <div class="bg-gray-50 p-2 rounded space-y-1">
        <div class="flex justify-between">
          <span class="text-sm font-medium">${item.geometry_type}</span>
          <button data-index="${index}" class="text-red-600 text-sm btn-remove-pending">Hapus</button>
        </div>
        <input type="text" placeholder="Nama Layer" data-index="${index}" class="w-full border rounded px-2 py-1 text-sm pending-nama" value="${item.nama_layer}">
        <input type="color" data-index="${index}" class="pending-warna" value="${item.warna}">
        <textarea placeholder="Keterangan" data-index="${index}" class="w-full border rounded px-2 py-1 text-sm pending-ket">${item.keterangan}</textarea>
      </div>
    `,
      )
      .join("");

    pendingDiv.querySelectorAll(".btn-remove-pending").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        map.removeLayer(pendingGeometries[index].layer);
        pendingGeometries.splice(index, 1);
        updatePendingList();
        updateSaveButton();
      });
    });
    pendingDiv.querySelectorAll(".pending-nama").forEach((input) => {
      input.addEventListener("input", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        pendingGeometries[index].nama_layer = e.target.value;
      });
    });
    pendingDiv.querySelectorAll(".pending-warna").forEach((input) => {
      input.addEventListener("input", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        pendingGeometries[index].warna = e.target.value;
        const layer = pendingGeometries[index].layer;
        if (layer.setStyle) layer.setStyle({ color: e.target.value });
      });
    });
    pendingDiv.querySelectorAll(".pending-ket").forEach((textarea) => {
      textarea.addEventListener("input", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        pendingGeometries[index].keterangan = e.target.value;
      });
    });
  }

  function updateSaveButton() {
    const btn = document.getElementById("btn-save-all");
    if (btn) btn.disabled = pendingGeometries.length === 0 || !selectedKKPRId;
  }

  async function saveAllPending() {
    if (pendingGeometries.length === 0 || !selectedKKPRId) return;
    const btn = document.getElementById("btn-save-all");
    btn.disabled = true;
    btn.textContent = "Menyimpan...";
    try {
      for (const item of pendingGeometries) {
        await pemetaanApi.create({
          kkpr: selectedKKPRId,
          nama_layer: item.nama_layer || "Layer",
          geometry: item.geometry,
          geometry_type: item.geometry_type,
          warna: item.warna,
          keterangan: item.keterangan,
        });
      }
      pendingGeometries.forEach((item) => map.removeLayer(item.layer));
      pendingGeometries = [];
      updatePendingList();
      updateSaveButton();
      loadSavedPemetaan();
      showToast("Semua pemetaan berhasil disimpan", "success");
    } catch (error) {
      console.error(error);
      let message = "Gagal menyimpan pemetaan";
      if (error.response?.data) message = JSON.stringify(error.response.data);
      showToast(message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Simpan Semua";
    }
  }

  // Event listeners
  document.getElementById("btn-load")?.addEventListener("click", () => {
    selectedKKPRId = document.getElementById("select-kkpr").value;
    if (!selectedKKPRId) {
      showToast("Pilih KKPR terlebih dahulu", "warning");
      return;
    }
    loadSavedPemetaan();
    updateSaveButton();
  });

  document.getElementById("draw-point")?.addEventListener("click", () => {
    if (!selectedKKPRId) {
      showToast("Pilih KKPR terlebih dahulu", "warning");
      return;
    }
    new L.Draw.Marker(map).enable();
  });
  document.getElementById("draw-line")?.addEventListener("click", () => {
    if (!selectedKKPRId) {
      showToast("Pilih KKPR terlebih dahulu", "warning");
      return;
    }
    new L.Draw.Polyline(map).enable();
  });
  document.getElementById("draw-polygon")?.addEventListener("click", () => {
    if (!selectedKKPRId) {
      showToast("Pilih KKPR terlebih dahulu", "warning");
      return;
    }
    new L.Draw.Polygon(map).enable();
  });

  document.getElementById("clear-drawings")?.addEventListener("click", () => {
    pendingGeometries.forEach((item) => map.removeLayer(item.layer));
    pendingGeometries = [];
    updatePendingList();
    updateSaveButton();
  });

  document
    .getElementById("btn-save-all")
    ?.addEventListener("click", saveAllPending);

  // Inisialisasi
  initMap();
  loadKKPROptions();
}
