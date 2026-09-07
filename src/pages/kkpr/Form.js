import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { kkprApi } from "../../api/kkprApi";
import { showToast } from "../../components/layout/Toast";
import { dokumenApi } from "../../api/dokumenApi";

export default function KKPRForm(user, id = null) {
  const isEdit = id !== null;
  return `
    <div class="space-y-6" id="kkpr-form-container">
      <h2 class="text-2xl font-bold text-gray-800">${isEdit ? "Edit KKPR" : "Tambah KKPR"}</h2>
      <form id="kkpr-form" class="space-y-6">
        <!-- A. Informasi Register -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">A. Informasi Register</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">ID Register</label>
              <input type="text" name="id_register" required class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">No KKPR</label>
              <input type="text" name="no_kkpr" required class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal Penerbit</label>
              <input type="date" name="tanggal_penerbit" class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
          </div>
        </div>
        <!-- B. Informasi Pemohon -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">B. Informasi Pemohon</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Pemohon</label>
            <input type="text" name="pemohon" required class="mt-1 block w-full border rounded-md px-3 py-2">
          </div>
        </div>
        <!-- C. Informasi Kegiatan -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">C. Informasi Kegiatan</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nama Kegiatan</label>
              <input type="text" name="nama_kegiatan" required class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Jenis Kegiatan</label>
              <input type="text" name="jenis_kegiatan" required class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
          </div>
        </div>
        <!-- D. Lokasi -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">D. Lokasi</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Kecamatan</label>
              <select name="kecamatan" id="select-kecamatan" required class="mt-1 block w-full border rounded-md px-3 py-2">
                <option value="">Pilih Kecamatan</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Desa/Kelurahan</label>
              <select name="desa_kelurahan" id="select-desa" required class="mt-1 block w-full border rounded-md px-3 py-2">
                <option value="">Pilih Desa</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Alamat Lokasi</label>
              <textarea name="alamat_lokasi" rows="2" class="mt-1 block w-full border rounded-md px-3 py-2"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Latitude</label>
              <input type="number" step="any" name="latitude" id="latitude" class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Longitude</label>
              <input type="number" step="any" name="longitude" id="longitude" class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div class="md:col-span-2">
              <p class="text-sm text-gray-500">Klik pada peta di bagian F untuk mengisi koordinat.</p>
            </div>
          </div>
        </div>
        <!-- E. Luas & Zonasi -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">E. Luas & Zonasi</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Luas Lahan (m²)</label>
              <input type="number" step="0.01" name="luas" class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Zonasi</label>
              <select name="zonasi" id="select-zonasi" class="mt-1 block w-full border rounded-md px-3 py-2">
                <option value="">Pilih Zonasi</option>
              </select>
            </div>
          </div>
        </div>
        <!-- F. Spasial (Geometry) -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">F. Spasial (Geometry)</h3>
          <input type="hidden" name="geometry" id="geometry-input" value="">
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button type="button" id="btn-draw-point" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Point</button>
              <button type="button" id="btn-draw-line" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Line</button>
              <button type="button" id="btn-draw-polygon" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Polygon</button>
              <button type="button" id="btn-clear-geometry" class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm">Hapus Geometry</button>
            </div>
            <div id="map" class="w-full h-64 rounded-md border"></div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Upload GeoJSON</label>
              <input type="file" id="file-geojson" accept=".geojson,.json" class="mt-1 block w-full text-sm">
            </div>
            <p class="text-xs text-gray-500">Geometry yang digambar atau diupload akan disimpan otomatis.</p>
          </div>
        </div>
        <!-- G. Dokumen -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">G. Dokumen</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Dokumen Legalitas</label>
              <input type="file" name="dokumen_legalitas" class="mt-1 block w-full text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Dokumen Spasial</label>
              <input type="file" name="dokumen_spasial" class="mt-1 block w-full text-sm">
            </div>
          </div>
        </div>
        <!-- Tombol -->
        <div class="flex justify-end space-x-3">
          <a href="/kkpr" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Batal</a>
          <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">${isEdit ? "Simpan Perubahan" : "Simpan Permohonan KKPR"}</button>
        </div>
      </form>
    </div>
  `;
}

export function initKKPRForm(user, id = null) {
  const container = document.getElementById("kkpr-form-container");
  if (!container) return;

  const isEdit = id !== null;
  let map = null;
  let drawnLayer = null;
  let currentGeometry = null;

  function initMap() {
    const mapElement = container.querySelector("#map");
    if (!mapElement || mapElement._leaflet_id) return;
    map = L.map(mapElement).setView([-9.5, 124.8], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    map.on("click", (e) => {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      container.querySelector("#latitude").value = lat;
      container.querySelector("#longitude").value = lng;
    });

    map.on(L.Draw.Event.CREATED, (event) => {
      if (drawnLayer) map.removeLayer(drawnLayer);
      drawnLayer = event.layer;
      map.addLayer(drawnLayer);
      currentGeometry = drawnLayer.toGeoJSON().geometry;
      container.querySelector("#geometry-input").value =
        JSON.stringify(currentGeometry);
      if (currentGeometry.type === "Point") {
        container.querySelector("#latitude").value =
          currentGeometry.coordinates[1].toFixed(6);
        container.querySelector("#longitude").value =
          currentGeometry.coordinates[0].toFixed(6);
      } else if (
        currentGeometry.type === "Polygon" ||
        currentGeometry.type === "LineString"
      ) {
        const firstCoord =
          currentGeometry.coordinates[0][0] || currentGeometry.coordinates[0];
        container.querySelector("#latitude").value = firstCoord[1].toFixed(6);
        container.querySelector("#longitude").value = firstCoord[0].toFixed(6);
      }
    });

    container
      .querySelector("#btn-draw-point")
      .addEventListener("click", () => new L.Draw.Marker(map).enable());
    container
      .querySelector("#btn-draw-line")
      .addEventListener("click", () => new L.Draw.Polyline(map).enable());
    container
      .querySelector("#btn-draw-polygon")
      .addEventListener("click", () => new L.Draw.Polygon(map).enable());
    container
      .querySelector("#btn-clear-geometry")
      .addEventListener("click", () => {
        if (drawnLayer) map.removeLayer(drawnLayer);
        drawnLayer = null;
        currentGeometry = null;
        container.querySelector("#geometry-input").value = "";
      });
  }

  const loadOptions = async () => {
    try {
      const kecData = await kkprApi.getKecamatan();
      const kecList = kecData.results || kecData;
      const kecamatanSelect = container.querySelector("#select-kecamatan");
      kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
      kecList.forEach((kec) => {
        const opt = document.createElement("option");
        opt.value = kec.id;
        opt.textContent = kec.nama;
        kecamatanSelect.appendChild(opt);
      });

      const zonData = await kkprApi.getZonasi();
      const zonList = zonData.results || zonData;
      const zonasiSelect = container.querySelector("#select-zonasi");
      zonasiSelect.innerHTML = '<option value="">Pilih Zonasi</option>';
      zonList.forEach((zon) => {
        const opt = document.createElement("option");
        opt.value = zon.id;
        opt.textContent = `${zon.kode_zonasi} - ${zon.nama_zonasi}`;
        zonasiSelect.appendChild(opt);
      });
    } catch (error) {
      console.error("Gagal memuat opsi:", error);
      showToast("Gagal memuat data kecamatan/zonasi", "error");
    }
  };

  container
    .querySelector("#select-kecamatan")
    .addEventListener("change", async (e) => {
      const kecId = e.target.value;
      const desaSelect = container.querySelector("#select-desa");
      desaSelect.innerHTML = '<option value="">Pilih Desa</option>';
      if (!kecId) return;
      try {
        const desaData = await kkprApi.getDesa(kecId);
        const desaList = desaData.results || desaData;
        desaList.forEach((desa) => {
          const opt = document.createElement("option");
          opt.value = desa.id;
          opt.textContent = desa.nama;
          desaSelect.appendChild(opt);
        });
      } catch (error) {
        console.error("Gagal memuat desa", error);
      }
    });

  container.querySelector("#file-geojson").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const geojson = JSON.parse(ev.target.result);
        let geometry = null;
        if (geojson.type === "FeatureCollection") {
          if (geojson.features.length > 0)
            geometry = geojson.features[0].geometry;
          else throw new Error("FeatureCollection kosong");
        } else if (geojson.type === "Feature") {
          geometry = geojson.geometry;
        } else {
          geometry = geojson;
        }
        if (map && geometry) {
          if (drawnLayer) map.removeLayer(drawnLayer);
          drawnLayer = L.geoJSON(geometry).addTo(map);
          currentGeometry = geometry;
          container.querySelector("#geometry-input").value =
            JSON.stringify(geometry);
          const bounds = drawnLayer.getBounds();
          if (bounds.isValid()) map.fitBounds(bounds);
          if (geometry.type === "Point") {
            container.querySelector("#latitude").value =
              geometry.coordinates[1];
            container.querySelector("#longitude").value =
              geometry.coordinates[0];
          }
        }
        showToast("GeoJSON berhasil dimuat", "success");
      } catch (err) {
        showToast("Gagal membaca GeoJSON: " + err.message, "error");
      }
    };
    reader.readAsText(file);
  });

  container
    .querySelector("#kkpr-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;

      const data = {
        id_register: form.id_register.value,
        no_kkpr: form.no_kkpr.value,
        nama_kegiatan: form.nama_kegiatan.value,
        jenis_kegiatan: form.jenis_kegiatan.value,
        tanggal_penerbit: form.tanggal_penerbit.value || null,
        pemohon: form.pemohon.value,
        kecamatan: form.kecamatan.value || null,
        desa_kelurahan: form.desa_kelurahan.value || null,
        luas: form.luas.value || null,
        alamat_lokasi: form.alamat_lokasi.value || "",
        latitude: form.latitude.value ? parseFloat(form.latitude.value) : null,
        longitude: form.longitude.value
          ? parseFloat(form.longitude.value)
          : null,
        zonasi: form.zonasi.value || null,
        geometry: currentGeometry,
      };

      try {
        let kkprId;
        if (isEdit) {
          await kkprApi.update(id, data);
          kkprId = id;
          showToast("Data KKPR berhasil diperbarui", "success");
        } else {
          const created = await kkprApi.create(data);
          kkprId = created.id;
          showToast("Data KKPR berhasil disimpan", "success");
        }

        // Upload dokumen jika ada
        const legalFile = form.dokumen_legalitas.files[0];
        const spasialFile = form.dokumen_spasial.files[0];

        if (legalFile) {
          const fd = new FormData();
          fd.append("kkpr", kkprId);
          fd.append("nama_dokumen", legalFile.name);
          fd.append("kategori", "LEGALITAS");
          fd.append("file", legalFile);
          await dokumenApi.create(fd);
        }

        if (spasialFile) {
          const fd = new FormData();
          fd.append("kkpr", kkprId);
          fd.append("nama_dokumen", spasialFile.name);
          fd.append("kategori", "SPASIAL");
          fd.append("file", spasialFile);
          await dokumenApi.create(fd);
        }

        window.location.href = "/kkpr";
      } catch (error) {
        console.error(error);
        let message = "Gagal menyimpan data";
        if (error.response?.data) {
          message = JSON.stringify(error.response.data);
        }
        showToast(message, "error");
      }
    });

  if (isEdit) {
    loadOptions()
      .then(() => {
        initMap();
        return kkprApi.getDetail(id);
      })
      .then((data) => {
        const form = container.querySelector("#kkpr-form");
        form.id_register.value = data.id_register;
        form.no_kkpr.value = data.no_kkpr;
        form.nama_kegiatan.value = data.nama_kegiatan;
        form.jenis_kegiatan.value = data.jenis_kegiatan;
        form.tanggal_penerbit.value = data.tanggal_penerbit;
        form.pemohon.value = data.pemohon;
        form.alamat_lokasi.value = data.alamat_lokasi || "";
        form.latitude.value = data.latitude ?? "";
        form.longitude.value = data.longitude ?? "";
        form.luas.value = data.luas ?? "";
        if (data.geometry) {
          currentGeometry = data.geometry;
          container.querySelector("#geometry-input").value = JSON.stringify(
            data.geometry,
          );
          drawnLayer = L.geoJSON(data.geometry).addTo(map);
          const bounds = drawnLayer.getBounds();
          if (bounds.isValid()) map.fitBounds(bounds);
        }
        if (data.kecamatan) {
          form.kecamatan.value = data.kecamatan;
          form.kecamatan.dispatchEvent(new Event("change"));
          const desaSelect = form.desa_kelurahan;
          const checkDesa = setInterval(() => {
            if (desaSelect.options.length > 1) {
              desaSelect.value = data.desa_kelurahan;
              clearInterval(checkDesa);
            }
          }, 200);
        }
        if (data.zonasi) form.zonasi.value = data.zonasi;
      })
      .catch((error) => {
        console.error(error);
        showToast("Gagal memuat data KKPR", "error");
      });
  } else {
    loadOptions()
      .then(() => {
        initMap();
      })
      .catch((error) => console.error(error));
  }
}
