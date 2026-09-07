import { kkprApi } from "../../api/kkprApi";
import { verifikasiApi } from "../../api/verifikasiApi";
import { showToast } from "../../components/layout/Toast";
import L from "leaflet";

export default function VerificationForm(user, id) {
  return `
    <div class="space-y-6" id="verification-form-container">
      <h2 class="text-2xl font-bold text-gray-800">Verifikasi Spasial</h2>
      <div id="verification-content" class="p-6">Loading...</div>
    </div>
  `;
}

export function initVerificationForm(user, id) {
  const container = document.getElementById("verification-content");
  if (!container) return;

  const loadDetail = async () => {
    try {
      const data = await kkprApi.getDetail(id);
      container.innerHTML = `
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-800">Verifikasi Spasial: ${data.no_kkpr}</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow p-6 space-y-4">
              <h3 class="text-lg font-semibold">Detail KKPR</h3>
              <dl class="grid grid-cols-1 gap-2">
                <div><dt class="text-sm font-medium text-gray-500">Nama Kegiatan</dt><dd class="text-gray-900">${data.nama_kegiatan}</dd></div>
                <div><dt class="text-sm font-medium text-gray-500">Pemohon</dt><dd class="text-gray-900">${data.pemohon}</dd></div>
                <div><dt class="text-sm font-medium text-gray-500">Kecamatan</dt><dd class="text-gray-900">${data.kecamatan_nama || "-"}</dd></div>
                <div><dt class="text-sm font-medium text-gray-500">Desa</dt><dd class="text-gray-900">${data.desa_nama || "-"}</dd></div>
                <div><dt class="text-sm font-medium text-gray-500">Luas</dt><dd class="text-gray-900">${data.luas || "-"} m²</dd></div>
                <div><dt class="text-sm font-medium text-gray-500">Alamat</dt><dd class="text-gray-900">${data.alamat_lokasi || "-"}</dd></div>
              </dl>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold mb-4">Peta Lokasi</h3>
              <div id="map-detail" class="w-full h-64 rounded-md border"></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Form Verifikasi</h3>
            <form id="verification-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Status Kesesuaian</label>
                <select name="status_kesesuaian" required class="mt-1 block w-full border rounded-md px-3 py-2">
                  <option value="">Pilih Status</option>
                  <option value="SESUAI">Sesuai</option>
                  <option value="TIDAK_SESUAI">Tidak Sesuai</option>
                  <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Catatan / Telaah Spasial</label>
                <textarea name="catatan_telaah" rows="4" class="mt-1 block w-full border rounded-md px-3 py-2" placeholder="Masukkan catatan telaah spasial..."></textarea>
              </div>
              <div class="flex justify-end space-x-3">
                <a href="/gis/verification" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Batal</a>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Simpan Verifikasi</button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Init map
      const mapDiv = container.querySelector("#map-detail");
      if (mapDiv) {
        const map = L.map(mapDiv).setView(
          [data.latitude || -9.5, data.longitude || 124.8],
          13,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
        }).addTo(map);
        if (data.geometry && data.geometry.type) {
          const geoLayer = L.geoJSON(data.geometry).addTo(map);
          const bounds = geoLayer.getBounds();
          if (bounds.isValid()) map.fitBounds(bounds);
        } else if (data.latitude && data.longitude) {
          L.marker([data.latitude, data.longitude])
            .addTo(map)
            .bindPopup("Lokasi");
          map.setView([data.latitude, data.longitude], 15);
        }
      }

      // Submit form
      container
        .querySelector("#verification-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const form = e.target;
          const payload = {
            kkpr: id,
            status_kesesuaian: form.status_kesesuaian.value,
            catatan_telaah: form.catatan_telaah.value,
          };
          try {
            await verifikasiApi.create(payload);
            showToast("Verifikasi berhasil disimpan", "success");
            window.location.href = "/gis/verification";
          } catch (error) {
            console.error(error);
            let message = "Gagal menyimpan verifikasi";
            if (error.response?.data)
              message = JSON.stringify(error.response.data);
            showToast(message, "error");
          }
        });
    } catch (error) {
      container.innerHTML = `<div class="p-6 text-red-500">Gagal memuat data: ${error.message}</div>`;
    }
  };

  loadDetail();
}
