import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { layerApi } from "../../api/layerApi";
import { showToast } from "../../components/layout/Toast";

export default function LayerList(user) {
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Layer GIS</h2>
        <div class="flex gap-2">
          <button id="btn-add-layer" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Upload Layer</button>
          <button id="btn-draw-layer" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">✏️ Gambar Layer</button>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Layer</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sumber</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktif</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody id="layer-tbody">
            <tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Upload File -->
      <div id="modal-upload" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 id="upload-modal-title" class="text-lg font-semibold">Upload Layer</h3>
            <button id="btn-close-upload" class="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <form id="upload-layer-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nama Layer</label>
              <input type="text" name="nama_layer" required class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Jenis Layer</label>
              <input type="text" name="jenis_layer" required class="mt-1 block w-full border rounded-md px-3 py-2" placeholder="misal: Batas Administrasi">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Sumber</label>
              <input type="text" name="sumber" class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">File GeoJSON</label>
              <input type="file" name="file_geojson" accept=".geojson,.json" class="mt-1 block w-full text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Warna Default</label>
              <input type="color" name="warna" value="#3388ff" class="mt-1">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Opacity</label>
              <input type="number" name="opacity" min="0" max="1" step="0.1" value="1.0" class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="inline-flex items-center">
                <input type="checkbox" name="aktif" checked class="rounded border-gray-300">
                <span class="ml-2 text-sm text-gray-700">Aktif</span>
              </label>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" id="btn-cancel-upload" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Gambar Layer -->
      <div id="modal-draw" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-5 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 id="draw-modal-title" class="text-lg font-semibold">Gambar Layer</h3>
            <button id="btn-close-draw" class="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <form id="draw-layer-form" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nama Layer</label>
                <input type="text" name="nama_layer" required class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Jenis Layer</label>
                <input type="text" name="jenis_layer" required class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Warna</label>
                <input type="color" name="warna" value="#3388ff" class="mt-1">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Opacity</label>
                <input type="number" name="opacity" min="0" max="1" step="0.1" value="1.0" class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
            </div>
            <div>
              <div class="flex gap-2 mb-2">
                <button type="button" id="draw-point" class="px-3 py-1 bg-gray-200 rounded">Point</button>
                <button type="button" id="draw-line" class="px-3 py-1 bg-gray-200 rounded">Line</button>
                <button type="button" id="draw-polygon" class="px-3 py-1 bg-gray-200 rounded">Polygon</button>
                <button type="button" id="clear-draw" class="px-3 py-1 bg-red-200 rounded">Clear</button>
              </div>
              <div id="draw-map" class="w-full h-72 rounded-md border"></div>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" id="btn-cancel-draw" class="px-4 py-2 border rounded-md text-gray-700">Batal</button>
              <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-md">Simpan Layer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function initLayerList(user) {
  let editingId = null;
  let editingLayerData = null; // untuk mode edit
  let drawMap = null;
  let drawnLayer = null; // layer tunggal untuk disimpan
  let currentModal = null; // 'upload' atau 'draw'

  // ======== Load Data ==========
  async function loadData() {
    const tbody = document.getElementById("layer-tbody");
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>';
    try {
      const data = await layerApi.getList();
      const results = data.results || data;
      if (results.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Belum ada layer.</td></tr>';
        return;
      }
      tbody.innerHTML = results
        .map(
          (item) => `
        <tr>
          <td class="px-4 py-3 text-sm">${item.nama_layer}</td>
          <td class="px-4 py-3 text-sm">${item.jenis_layer}</td>
          <td class="px-4 py-3 text-sm">${item.sumber || "-"}</td>
          <td class="px-4 py-3 text-sm">
            <span class="px-2 py-1 text-xs rounded-full ${item.aktif ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}">${item.aktif ? "Aktif" : "Nonaktif"}</span>
          </td>
          <td class="px-4 py-3 text-sm whitespace-nowrap">
            ${
              user.role === "ADMIN" || user.role === "OPERATOR_GIS"
                ? `
              <button data-id="${item.id}" class="text-blue-600 hover:underline btn-edit">Edit</button> | 
              <button data-id="${item.id}" class="text-red-600 hover:underline btn-delete">Hapus</button>
            `
                : ""
            }
          </td>
        </tr>
      `,
        )
        .join("");

      // Edit
      tbody.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const item = results.find((r) => r.id == id);
          if (item) {
            if (item.geometry) {
              // Buka modal gambar untuk edit geometry
              openDrawModal(true, item);
            } else {
              // Buka modal upload untuk edit file
              openUploadModal(true, item);
            }
          }
        });
      });

      // Delete
      tbody.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Yakin ingin menghapus layer ini?")) {
            try {
              await layerApi.delete(id);
              showToast("Layer dihapus", "success");
              loadData();
            } catch (error) {
              showToast("Gagal menghapus layer", "error");
            }
          }
        });
      });
    } catch (error) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="px-4 py-6 text-center text-red-500">Gagal memuat data.</td></tr>';
      showToast("Gagal memuat layer", "error");
    }
  }

  // ======== Modal Upload ==========
  function openUploadModal(isEdit = false, layer = null) {
    currentModal = "upload";
    const modal = document.getElementById("modal-upload");
    modal.classList.remove("hidden");
    const form = document.getElementById("upload-layer-form");
    form.reset();
    if (isEdit && layer) {
      editingId = layer.id;
      editingLayerData = layer;
      document.getElementById("upload-modal-title").textContent = "Edit Layer";
      form.nama_layer.value = layer.nama_layer;
      form.jenis_layer.value = layer.jenis_layer;
      form.sumber.value = layer.sumber || "";
      form.warna.value = layer.warna || "#3388ff";
      form.opacity.value = layer.opacity || 1.0;
      form.aktif.checked = layer.aktif;
    } else {
      editingId = null;
      editingLayerData = null;
      document.getElementById("upload-modal-title").textContent =
        "Upload Layer";
    }
  }

  function closeUploadModal() {
    document.getElementById("modal-upload").classList.add("hidden");
    editingId = null;
    editingLayerData = null;
  }

  // ======== Modal Draw ==========
  function initDrawMap(geometry = null) {
    const mapElement = document.getElementById("draw-map");
    if (!mapElement || mapElement._leaflet_id) return;
    drawMap = L.map(mapElement).setView([-9.5, 124.8], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(drawMap);

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
    drawMap.addControl(drawControl);

    drawMap.on(L.Draw.Event.CREATED, (event) => {
      if (drawnLayer) {
        drawMap.removeLayer(drawnLayer);
      }
      drawnLayer = event.layer;
      drawnLayer.addTo(drawMap);
    });

    document.getElementById("clear-draw")?.addEventListener("click", () => {
      if (drawnLayer) {
        drawMap.removeLayer(drawnLayer);
        drawnLayer = null;
      }
    });

    // Jika edit dan punya geometry, tampilkan
    if (geometry) {
      drawnLayer = L.geoJSON(geometry).addTo(drawMap);
      const bounds = drawnLayer.getBounds();
      if (bounds.isValid()) drawMap.fitBounds(bounds);
    }
  }

  function openDrawModal(isEdit = false, layer = null) {
    currentModal = "draw";
    document.getElementById("modal-draw").classList.remove("hidden");
    const form = document.getElementById("draw-layer-form");
    form.reset();
    if (isEdit && layer) {
      editingId = layer.id;
      editingLayerData = layer;
      document.getElementById("draw-modal-title").textContent = "Edit Layer";
      form.nama_layer.value = layer.nama_layer;
      form.jenis_layer.value = layer.jenis_layer;
      form.warna.value = layer.warna || "#3388ff";
      form.opacity.value = layer.opacity || 1.0;
    } else {
      editingId = null;
      editingLayerData = null;
      document.getElementById("draw-modal-title").textContent = "Gambar Layer";
    }

    // Inisialisasi peta setelah modal terlihat
    setTimeout(() => {
      initDrawMap(isEdit ? layer.geometry : null);
      if (drawMap) drawMap.invalidateSize();
    }, 100);
  }

  function closeDrawModal() {
    document.getElementById("modal-draw").classList.add("hidden");
    if (drawMap) {
      drawMap.remove();
      drawMap = null;
      drawnLayer = null;
    }
    editingId = null;
    editingLayerData = null;
  }

  // ======== Submit Upload ==========
  document
    .getElementById("upload-layer-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      formData.set("aktif", form.aktif.checked ? "true" : "false");
      if (!form.file_geojson.files.length) {
        formData.delete("file_geojson");
      }
      try {
        if (editingId) {
          await layerApi.updateWithFile(editingId, formData);
          showToast("Layer diperbarui", "success");
        } else {
          await layerApi.createWithFile(formData);
          showToast("Layer ditambahkan", "success");
        }
        closeUploadModal();
        loadData();
      } catch (error) {
        console.error(error);
        let message = "Gagal menyimpan layer";
        if (error.response?.data) message = JSON.stringify(error.response.data);
        showToast(message, "error");
      }
    });

  // ======== Submit Draw ==========
  document
    .getElementById("draw-layer-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!drawnLayer) {
        showToast("Gambar geometry terlebih dahulu", "warning");
        return;
      }
      const form = e.target;
      const geometry = drawnLayer.toGeoJSON().geometry;

      const payload = {
        nama_layer: form.nama_layer.value,
        jenis_layer: form.jenis_layer.value,
        warna: form.warna.value,
        opacity: form.opacity.value,
        aktif: true,
        geometry: geometry,
      };

      try {
        if (editingId) {
          await layerApi.update(editingId, payload);
          showToast("Layer diperbarui", "success");
        } else {
          await layerApi.create(payload);
          showToast("Layer berhasil disimpan", "success");
        }
        closeDrawModal();
        loadData();
      } catch (error) {
        console.error(error);
        let message = "Gagal menyimpan layer";
        if (error.response?.data) message = JSON.stringify(error.response.data);
        showToast(message, "error");
      }
    });

  // ======== Event Listeners ==========
  document
    .getElementById("btn-add-layer")
    ?.addEventListener("click", () => openUploadModal(false));
  document
    .getElementById("btn-close-upload")
    ?.addEventListener("click", closeUploadModal);
  document
    .getElementById("btn-cancel-upload")
    ?.addEventListener("click", closeUploadModal);

  document
    .getElementById("btn-draw-layer")
    ?.addEventListener("click", () => openDrawModal(false));
  document
    .getElementById("btn-close-draw")
    ?.addEventListener("click", closeDrawModal);
  document
    .getElementById("btn-cancel-draw")
    ?.addEventListener("click", closeDrawModal);

  document.getElementById("draw-point")?.addEventListener("click", () => {
    if (drawMap) new L.Draw.Marker(drawMap).enable();
  });
  document.getElementById("draw-line")?.addEventListener("click", () => {
    if (drawMap) new L.Draw.Polyline(drawMap).enable();
  });
  document.getElementById("draw-polygon")?.addEventListener("click", () => {
    if (drawMap) new L.Draw.Polygon(drawMap).enable();
  });

  // Inisialisasi awal
  loadData();
}
