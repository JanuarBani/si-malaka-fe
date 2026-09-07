import L from "leaflet";
import { kkprApi } from "../../api/kkprApi";
import { dokumenApi } from "../../api/dokumenApi";
import { showToast } from "../../components/layout/Toast";

export default function KKPRDetail(user, id) {
  return `
    <div class="space-y-6" id="kkpr-detail-container">
      <h2 class="text-2xl font-bold text-gray-800">Detail KKPR</h2>
      <div id="detail-content" class="p-6">Loading...</div>
    </div>
  `;
}

export function initKKPRDetail(user, id) {
  const container = document.getElementById("detail-content");
  if (!container) return;
  const role = user.role;

  const loadDetail = async () => {
    try {
      const data = await kkprApi.getDetail(id);
      let actions = "";
      if (role === "ADMIN") {
        actions += `<a href="/kkpr/edit/${id}" class="px-4 py-2 bg-green-600 text-white rounded">Edit</a>`;
        actions += `<button id="btn-delete" class="px-4 py-2 bg-red-600 text-white rounded ml-2">Hapus</button>`;
      }

      container.innerHTML = `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-800">Detail KKPR</h2>
            <div>${actions}</div>
          </div>

          <!-- Informasi Utama -->
          <div class="bg-white rounded-lg shadow p-6">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><dt class="text-sm font-medium text-gray-500">ID Register</dt><dd class="text-gray-900">${data.id_register}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">No KKPR</dt><dd class="text-gray-900">${data.no_kkpr}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Nama Kegiatan</dt><dd class="text-gray-900">${data.nama_kegiatan}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Jenis Kegiatan</dt><dd class="text-gray-900">${data.jenis_kegiatan}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Tanggal Penerbit</dt><dd class="text-gray-900">${data.tanggal_penerbit || "-"}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Pemohon</dt><dd class="text-gray-900">${data.pemohon}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Kecamatan</dt><dd class="text-gray-900">${data.kecamatan_nama || "-"}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Desa/Kelurahan</dt><dd class="text-gray-900">${data.desa_nama || "-"}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Luas</dt><dd class="text-gray-900">${data.luas || "-"} m²</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Status</dt><dd class="text-gray-900">${data.status}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Workflow</dt><dd class="text-gray-900">${data.workflow}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Alamat Lokasi</dt><dd class="text-gray-900">${data.alamat_lokasi || "-"}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Latitude</dt><dd class="text-gray-900">${data.latitude ?? "-"}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Longitude</dt><dd class="text-gray-900">${data.longitude ?? "-"}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Zonasi</dt><dd class="text-gray-900">${data.zonasi_nama || "-"}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Dibuat Oleh</dt><dd class="text-gray-900">${data.created_by_name || "-"}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Dibuat Pada</dt><dd class="text-gray-900">${new Date(data.created_at).toLocaleString("id-ID")}</dd></div>
            </dl>
          </div>

          <!-- Peta Lokasi -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Peta Lokasi</h3>
            <div id="map-detail" class="w-full h-64 rounded-md border"></div>
          </div>

          <!-- Geometry -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-2">Geometry</h3>
            <pre class="bg-gray-100 p-3 rounded text-sm overflow-auto">${data.geometry ? JSON.stringify(data.geometry, null, 2) : "Belum ada geometry"}</pre>
          </div>

          <!-- Dokumen -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Dokumen</h3>
              ${role === "ADMIN" ? '<button id="btn-upload-dokumen" class="px-3 py-1 bg-blue-600 text-white rounded">Upload</button>' : ""}
            </div>
            <div id="dokumen-list" class="space-y-2">Loading dokumen...</div>
            ${
              role === "ADMIN"
                ? `
            <form id="dokumen-upload-form" class="hidden mt-4 flex flex-wrap gap-2">
              <input type="file" name="file" required class="border rounded px-2 py-1">
              <input type="text" name="nama_dokumen" placeholder="Nama dokumen" class="border rounded px-2 py-1">
              <select name="kategori" class="border rounded px-2 py-1">
                <option value="LEGALITAS">Legalitas</option>
                <option value="SPASIAL">Spasial</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
              <button type="submit" class="px-3 py-1 bg-green-600 text-white rounded">Simpan</button>
              <button type="button" id="btn-cancel-upload" class="px-3 py-1 bg-gray-300 rounded">Batal</button>
            </form>
            `
                : ""
            }
          </div>
        </div>
      `;

      // Event hapus KKPR
      const btnDelete = container.querySelector("#btn-delete");
      if (btnDelete) {
        btnDelete.addEventListener("click", async () => {
          if (confirm("Yakin ingin menghapus data ini?")) {
            try {
              await kkprApi.delete(id);
              showToast("Data berhasil dihapus", "success");
              window.location.href = "/kkpr";
            } catch (error) {
              showToast("Gagal menghapus data", "error");
            }
          }
        });
      }

      // Inisialisasi peta
      initMapDetail(data);

      // Inisialisasi dokumen
      loadDocuments(id);

      // Event upload dokumen
      const btnUpload = container.querySelector("#btn-upload-dokumen");
      const uploadForm = container.querySelector("#dokumen-upload-form");
      const btnCancelUpload = container.querySelector("#btn-cancel-upload");
      if (btnUpload && uploadForm) {
        btnUpload.addEventListener("click", () => {
          uploadForm.classList.toggle("hidden");
        });
        btnCancelUpload?.addEventListener("click", () => {
          uploadForm.classList.add("hidden");
          uploadForm.reset();
        });
        uploadForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(uploadForm);
          formData.append("kkpr", id);
          try {
            await dokumenApi.create(formData);
            showToast("Dokumen berhasil diupload", "success");
            uploadForm.reset();
            uploadForm.classList.add("hidden");
            loadDocuments(id);
          } catch (error) {
            console.error(error);
            showToast("Gagal upload dokumen", "error");
          }
        });
      }
    } catch (error) {
      container.innerHTML = `<div class="p-6 text-red-500">Gagal memuat data: ${error.message}</div>`;
    }
  };

  const initMapDetail = (data) => {
    const mapContainer = document.getElementById("map-detail");
    if (!mapContainer) return;
    if (mapContainer._leaflet_id) return; // sudah diinisialisasi

    const lat = data.latitude || -9.5;
    const lng = data.longitude || 124.8;
    const map = L.map(mapContainer).setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    if (data.geometry && data.geometry.type) {
      const geoLayer = L.geoJSON(data.geometry).addTo(map);
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds);
      }
    } else if (data.latitude && data.longitude) {
      L.marker([data.latitude, data.longitude])
        .addTo(map)
        .bindPopup(`${data.no_kkpr}<br>${data.nama_kegiatan}`)
        .openPopup();
    }
  };

  const loadDocuments = async (kkprId) => {
    const listContainer = document.getElementById("dokumen-list");
    if (!listContainer) return;
    try {
      const data = await dokumenApi.getList({ kkpr: kkprId });
      const results = data.results || data;
      if (results.length === 0) {
        listContainer.innerHTML =
          '<p class="text-gray-500">Tidak ada dokumen.</p>';
      } else {
        listContainer.innerHTML = results
          .map(
            (doc) => `
          <div class="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div class="flex-1">
              <p class="text-sm font-medium">${doc.nama_dokumen}</p>
              <p class="text-xs text-gray-500">${doc.kategori} • ${new Date(doc.tanggal_upload).toLocaleString("id-ID")} • ${doc.pengunggah_nama || "-"}</p>
            </div>
            <div class="flex gap-2">
              <a href="${doc.file}" target="_blank" class="text-blue-600 hover:underline text-sm">Lihat</a>
              ${role === "ADMIN" ? `<button data-id="${doc.id}" class="text-red-600 hover:underline text-sm btn-delete-doc">Hapus</button>` : ""}
            </div>
          </div>
        `,
          )
          .join("");
        listContainer.querySelectorAll(".btn-delete-doc").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const docId = e.target.getAttribute("data-id");
            if (confirm("Hapus dokumen ini?")) {
              try {
                await dokumenApi.delete(docId);
                showToast("Dokumen dihapus", "success");
                loadDocuments(kkprId);
              } catch (error) {
                showToast("Gagal menghapus dokumen", "error");
              }
            }
          });
        });
      }
    } catch (error) {
      listContainer.innerHTML =
        '<p class="text-red-500">Gagal memuat dokumen.</p>';
    }
  };

  loadDetail();
}
