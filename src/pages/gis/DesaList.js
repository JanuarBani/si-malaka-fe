import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { desaApi } from "../../api/desaApi";
import { kecamatanApi } from "../../api/kecamatanApi";
import { showToast } from "../../components/layout/Toast";

export default function DesaList(user) {
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Manajemen Desa/Kelurahan</h2>
        <button id="btn-add-desa" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Tambah Desa</button>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kecamatan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody id="desa-tbody">
            <tr><td colspan="4" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <span id="pagination-info" class="text-sm text-gray-600"></span>
        <div class="space-x-2">
          <button id="btn-prev" class="px-3 py-1 border rounded disabled:opacity-50" disabled>Prev</button>
          <button id="btn-next" class="px-3 py-1 border rounded disabled:opacity-50" disabled>Next</button>
        </div>
      </div>

      <!-- Modal Tambah/Edit -->
      <div id="modal-desa" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 id="modal-title" class="text-lg font-semibold">Tambah Desa</h3>
            <button id="btn-close-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <form id="desa-form" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Kode</label>
                <input type="text" name="kode" required class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nama</label>
                <input type="text" name="nama" required class="mt-1 block w-full border rounded-md px-3 py-2">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Kecamatan</label>
                <select name="kecamatan" id="select-kecamatan" required class="mt-1 block w-full border rounded-md px-3 py-2">
                  <option value="">Pilih Kecamatan</option>
                </select>
              </div>
            </div>
            <input type="hidden" name="geometry" id="desa-geometry" value="">
            <div class="space-y-2">
              <div class="flex gap-2">
                <button type="button" id="btn-draw-polygon" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Gambar Polygon</button>
                <button type="button" id="btn-clear-geometry" class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Hapus Geometry</button>
                <label class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm cursor-pointer">
                  Upload GeoJSON
                  <input type="file" id="file-geojson" accept=".geojson,.json" class="hidden">
                </label>
              </div>
              <div id="map-desa" class="w-full h-64 rounded-md border"></div>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" id="btn-cancel-desa" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Detail -->
      <div id="modal-detail" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Detail Desa</h3>
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

export function initDesaList(user) {
  let map = null;
  let drawnLayer = null;
  let editingId = null;
  let detailMap = null;
  let detailLayer = null;

  // Pagination state
  let currentPage = 1;
  let totalCount = 0;
  let nextPage = null;
  let prevPage = null;

  async function loadKecamatanOptions() {
    const select = document.getElementById("select-kecamatan");
    if (!select) return;
    try {
      const data = await kecamatanApi.getList({ page_size: 100 });
      const results = data.results || data;
      select.innerHTML = '<option value="">Pilih Kecamatan</option>';
      results.forEach((kec) => {
        const opt = document.createElement("option");
        opt.value = kec.id;
        opt.textContent = kec.nama;
        select.appendChild(opt);
      });
    } catch (e) {
      console.error("Gagal memuat kecamatan", e);
    }
  }

  function initMap() {
    const mapElement = document.getElementById("map-desa");
    if (!mapElement) return;
    if (mapElement._leaflet_id) {
      // Jika peta sudah ada, bersihkan layer gambar sebelumnya
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
      document.getElementById("desa-geometry").value = JSON.stringify(
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
        document.getElementById("desa-geometry").value = "";
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
            document.getElementById("desa-geometry").value =
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

  async function loadData(page = currentPage) {
    const tbody = document.getElementById("desa-tbody");
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="4" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>';
    try {
      const data = await desaApi.getList({ page: page });
      totalCount = data.count;
      nextPage = data.next;
      prevPage = data.previous;
      const results = data.results || [];

      if (results.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="4" class="px-4 py-6 text-center text-gray-500">Belum ada desa.</td></tr>';
      } else {
        tbody.innerHTML = results
          .map(
            (d) => `
          <tr>
            <td class="px-4 py-3 text-sm">${d.kode}</td>
            <td class="px-4 py-3 text-sm">${d.nama}</td>
            <td class="px-4 py-3 text-sm">${d.kecamatan_nama || "-"}</td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <button data-id="${d.id}" class="text-blue-600 hover:underline btn-detail">Detail</button>
              <button data-id="${d.id}" class="ml-2 text-green-600 hover:underline btn-edit">Edit</button>
              <button data-id="${d.id}" class="ml-2 text-red-600 hover:underline btn-delete">Hapus</button>
            </td>
          </tr>
        `,
          )
          .join("");
      }

      // Update pagination info
      const pageSize = 20; // Sesuaikan dengan PAGE_SIZE backend jika berbeda
      const start = (currentPage - 1) * pageSize + 1;
      const end = Math.min(start + results.length - 1, totalCount);
      document.getElementById("pagination-info").textContent =
        `Menampilkan ${start}-${end} dari ${totalCount}`;
      document.getElementById("btn-prev").disabled = !prevPage;
      document.getElementById("btn-next").disabled = !nextPage;

      // Attach event pada tombol aksi
      tbody.querySelectorAll(".btn-detail").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const desa = results.find((r) => r.id == id);
          if (desa) openDetailModal(desa);
        });
      });

      tbody.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const desa = results.find((r) => r.id == id);
          if (desa) openEditModal(desa);
        });
      });

      tbody.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Yakin ingin menghapus desa ini?")) {
            try {
              await desaApi.delete(id);
              showToast("Desa dihapus", "success");
              loadData(currentPage); // reload halaman saat ini
            } catch (error) {
              showToast("Gagal menghapus desa", "error");
            }
          }
        });
      });
    } catch (error) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="px-4 py-6 text-center text-red-500">Gagal memuat data.</td></tr>';
      showToast("Gagal memuat desa", "error");
    }
  }

  function openModal() {
    const modal = document.getElementById("modal-desa");
    if (!modal) return;
    modal.classList.remove("hidden");
    document.getElementById("desa-form").reset();
    document.getElementById("desa-geometry").value = "";
    if (drawnLayer && map) map.removeLayer(drawnLayer);
    drawnLayer = null;
    editingId = null;
    document.getElementById("modal-title").textContent = "Tambah Desa";
    loadKecamatanOptions();
    initMap();
  }

  function openEditModal(desa) {
    const modal = document.getElementById("modal-desa");
    if (!modal) return;
    modal.classList.remove("hidden");
    document.getElementById("modal-title").textContent = "Edit Desa";
    const form = document.getElementById("desa-form");
    form.kode.value = desa.kode;
    form.nama.value = desa.nama;
    document.getElementById("desa-geometry").value = desa.geometry
      ? JSON.stringify(desa.geometry)
      : "";
    editingId = desa.id;
    loadKecamatanOptions().then(() => {
      form.kecamatan.value = desa.kecamatan;
    });
    initMap();
    if (desa.geometry && map) {
      setTimeout(() => {
        if (drawnLayer) map.removeLayer(drawnLayer);
        drawnLayer = L.geoJSON(desa.geometry).addTo(map);
        const bounds = drawnLayer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds);
      }, 100);
    }
  }

  function closeModal() {
    const modal = document.getElementById("modal-desa");
    if (modal) modal.classList.add("hidden");
    if (drawnLayer && map) {
      map.removeLayer(drawnLayer);
      drawnLayer = null;
    }
  }

  function openDetailModal(desa) {
    const modal = document.getElementById("modal-detail");
    if (!modal) return;
    modal.classList.remove("hidden");
    const content = document.getElementById("detail-content");
    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Kode</p>
          <p class="font-medium">${desa.kode}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Nama</p>
          <p class="font-medium">${desa.nama}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Kecamatan</p>
          <p class="font-medium">${desa.kecamatan_nama || "-"}</p>
        </div>
      </div>
      <div class="mt-4">
        <p class="text-sm font-medium mb-2">Lokasi Desa</p>
        <div id="map-detail-desa" class="w-full h-64 rounded-md border"></div>
      </div>
    `;
    initDetailMap(desa);
  }

  function initDetailMap(desa) {
    const mapElement = document.getElementById("map-detail-desa");
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

    if (desa.geometry && desa.geometry.type) {
      detailLayer = L.geoJSON(desa.geometry).addTo(detailMap);
      const bounds = detailLayer.getBounds();
      if (bounds.isValid()) detailMap.fitBounds(bounds);
    }
  }

  // Event listeners untuk modal detail
  document.getElementById("btn-close-detail")?.addEventListener("click", () => {
    document.getElementById("modal-detail")?.classList.add("hidden");
  });
  document.getElementById("btn-detail-close")?.addEventListener("click", () => {
    document.getElementById("modal-detail")?.classList.add("hidden");
  });

  // Event listeners untuk modal tambah/edit
  document.getElementById("btn-add-desa")?.addEventListener("click", openModal);
  document
    .getElementById("btn-close-modal")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("btn-cancel-desa")
    ?.addEventListener("click", closeModal);

  // Event listener untuk submit form
  document
    .getElementById("desa-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
        kode: form.kode.value,
        nama: form.nama.value,
        kecamatan: form.kecamatan.value,
        geometry: form.geometry.value ? JSON.parse(form.geometry.value) : null,
      };
      try {
        if (editingId) {
          await desaApi.update(editingId, payload);
          showToast("Desa diperbarui", "success");
        } else {
          await desaApi.create(payload);
          showToast("Desa ditambahkan", "success");
        }
        closeModal();
        loadData(currentPage); // reload halaman saat ini setelah aksi
      } catch (error) {
        console.error(error);
        let message = "Gagal menyimpan desa";
        if (error.response?.data) message = JSON.stringify(error.response.data);
        showToast(message, "error");
      }
    });

  // Event listeners untuk pagination
  document.getElementById("btn-prev")?.addEventListener("click", () => {
    if (prevPage) {
      currentPage--;
      loadData(currentPage);
    }
  });

  document.getElementById("btn-next")?.addEventListener("click", () => {
    if (nextPage) {
      currentPage++;
      loadData(currentPage);
    }
  });

  // Muat data awal
  loadData();
}
