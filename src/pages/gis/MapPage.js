import L from "leaflet";
import axiosInstance from "../../api/axios";

export default function MapPage(user) {
  return `
    <div class="space-y-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 class="text-2xl font-bold text-gray-800">Peta Interaktif</h2>
        <div class="flex gap-2">
          <select id="filter-kecamatan" class="border rounded-md px-3 py-2">
            <option value="">Semua Kecamatan</option>
          </select>
          <select id="filter-status" class="border rounded-md px-3 py-2">
            <option value="">Semua Status</option>
            <option value="SESUAI">Sesuai</option>
            <option value="TIDAK_SESUAI">Tidak Sesuai</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="TERPETAKAN">Terpetakan</option>
            <option value="SELESAI">Selesai</option>
          </select>
        </div>
      </div>
      <div class="relative">
        <div id="map" class="w-full h-[calc(100vh-12rem)] rounded-lg shadow-lg"></div>
        <!-- Panel Layer Kustom -->
        <div class="absolute top-2 right-2 z-[1000] bg-white p-2 rounded shadow max-h-80 overflow-auto w-48">
          <h4 class="font-semibold text-sm mb-2">Layers</h4>
          <div id="custom-layer-control" class="space-y-1"></div>
        </div>
      </div>
    </div>
  `;
}

export function initMap(container) {
  const mapElement = container.querySelector("#map");
  if (!mapElement || mapElement._leaflet_id) return;

  const map = L.map(mapElement).setView([-9.5, 124.8], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Fungsi warna berdasarkan workflow (dipindahkan ke scope initMap)
  const getColorByWorkflow = (workflow) => {
    const colors = {
      SESUAI: "#10b981",
      TIDAK_SESUAI: "#ef4444",
      MENUNGGU_VERIFIKASI: "#f59e0b",
      TERPETAKAN: "#3b82f6",
      SELESAI: "#8b5cf6",
      DRAFT: "#6b7280",
      DALAM_VERIFIKASI: "#6366f1",
    };
    return colors[workflow] || "#007bff";
  };

  // Fungsi untuk menambahkan popup dan event hover/klik
  const addPopupAndHover = (layer, content) => {
    layer.bindPopup(content);
    layer.on("mouseover", () => layer.openPopup());
    layer.on("mouseout", () => layer.closePopup());
    layer.on("click", () => {
      if (layer.isPopupOpen()) layer.closePopup();
      else layer.openPopup();
    });
  };

  // Objek layer dasar
  const layers = {
    kecamatan: L.geoJSON(null, {
      style: { color: "#3388ff", weight: 2, fillOpacity: 0.1 },
      interactive: true,
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const content = `<strong>${p.nama || "Kecamatan"}</strong><br>Kode: ${p.kode || "-"}`;
        addPopupAndHover(layer, content);
      },
    }),
    desa: L.geoJSON(null, {
      style: { color: "#6c757d", weight: 1, fillOpacity: 0.05 },
      interactive: true,
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const content = `<strong>${p.nama || "Desa"}</strong><br>Kode: ${p.kode || "-"}<br>Kecamatan ID: ${p.kecamatan_id || "-"}`;
        addPopupAndHover(layer, content);
      },
    }),
    zonasi: L.geoJSON(null, {
      style: (feature) => ({
        color: feature.properties.warna || "#3388ff",
        weight: 2,
        fillOpacity: 0.2,
      }),
      interactive: true,
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const content = `<strong>${p.nama_zonasi || "Zonasi"}</strong><br>Kode: ${p.kode_zonasi || "-"}<br>${p.deskripsi || ""}`;
        addPopupAndHover(layer, content);
      },
    }),
    rdtr: L.geoJSON(null, {
      style: { color: "#dc3545", weight: 2, fillOpacity: 0.1 },
      interactive: true,
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const content = `<strong>${p.nama || "RDTR"}</strong><br>Kode: ${p.kode || "-"}<br>Status: ${p.status || "-"}`;
        addPopupAndHover(layer, content);
      },
    }),
    pemetaan: L.geoJSON(null, {
      style: (feature) => ({
        color: feature.properties.warna || "#ff8800",
        weight: 3,
      }),
      interactive: true,
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const content = `<strong>${p.nama_layer || "Pemetaan"}</strong><br>${p.keterangan || ""}<br>Jenis: ${p.geometry_type || "-"}`;
        addPopupAndHover(layer, content);
      },
    }),
    kkpr: L.geoJSON(null, {
      pointToLayer: (feature, latlng) => {
        const p = feature.properties || {};
        const bgColor = getColorByWorkflow(p.workflow);
        const icon = L.divIcon({
          className: "kkpr-marker",
          html: `
            <div style="
              background-color: ${bgColor};
              color: white;
              border-radius: 50%;
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 9px;
              font-weight: bold;
              box-shadow: 0 0 6px rgba(0,0,0,0.5);
              border: 2px solid white;
              cursor: pointer;
            ">
              ${p.no_kkpr.split(" ").pop() || "KKPR"}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -18],
        });
        return L.marker(latlng, { icon, interactive: true });
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const p = feature.properties;
          const popupContent = `
            <div style="font-size: 12px; line-height: 1.5;">
              <strong>${p.no_kkpr}</strong><br>
              Kegiatan: ${p.nama_kegiatan}<br>
              Pemohon: ${p.pemohon}<br>
              Kecamatan: ${p.kecamatan || "-"}<br>
              Desa: ${p.desa || "-"}<br>
              Status: ${p.status}<br>
              Workflow: <span style="color: ${getColorByWorkflow(p.workflow)}; font-weight: bold;">${p.workflow}</span><br>
              Zonasi: ${p.zonasi || "-"}
            </div>
          `;
          addPopupAndHover(layer, popupContent);
        }
      },
    }),
  };

  // Tambahkan layer dasar ke peta
  Object.values(layers).forEach((layer) => layer.addTo(map));

  // Fungsi memuat GeoJSON dari URL
  const loadGeoJSON = async (url, layerGroup) => {
    try {
      const response = await axiosInstance.get(url);
      layerGroup.clearLayers();
      layerGroup.addData(response.data);
    } catch (error) {
      console.error(`Gagal memuat ${url}:`, error);
    }
  };

  // Muat data GeoJSON dasar
  loadGeoJSON("/gis/kecamatan/geojson/", layers.kecamatan);
  loadGeoJSON("/gis/desa/geojson/", layers.desa);
  loadGeoJSON("/gis/zonasi/geojson/", layers.zonasi);
  loadGeoJSON("/gis/rdtr/geojson/", layers.rdtr);
  loadGeoJSON("/gis/pemetaan/geojson/", layers.pemetaan);
  loadGeoJSON("/kkpr/kkpr/geojson/", layers.kkpr);

  // Kontrol layer Leaflet standar
  const layerControl = L.control
    .layers(
      null,
      {
        Kecamatan: layers.kecamatan,
        Desa: layers.desa,
        Zonasi: layers.zonasi,
        RDTR: layers.rdtr,
        Pemetaan: layers.pemetaan,
        KKPR: layers.kkpr,
      },
      { collapsed: false },
    )
    .addTo(map);

  window.layerControl = layerControl;

  L.control.scale().addTo(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 13);
      L.marker([pos.coords.latitude, pos.coords.longitude])
        .addTo(map)
        .bindPopup("Lokasi Anda")
        .openPopup();
    });
  }

  const loadKecamatanOptions = async () => {
    try {
      const resp = await axiosInstance.get("/gis/kecamatan/");
      const results = resp.data.results || resp.data;
      const select = container.querySelector("#filter-kecamatan");
      if (select) {
        results.forEach((kec) => {
          const opt = document.createElement("option");
          opt.value = kec.nama;
          opt.textContent = kec.nama;
          select.appendChild(opt);
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  loadKecamatanOptions();

  const filterKecamatanSelect = container.querySelector("#filter-kecamatan");
  const filterStatusSelect = container.querySelector("#filter-status");
  const applyFilters = () => {
    const kecamatan = filterKecamatanSelect.value;
    const status = filterStatusSelect.value;
    layers.kkpr.eachLayer((layer) => {
      const props = layer.feature.properties;
      let show = true;
      if (kecamatan && props.kecamatan !== kecamatan) show = false;
      if (status && props.workflow !== status) show = false;
      if (show) layer.addTo(map);
      else layer.removeFrom(map);
    });
  };
  filterKecamatanSelect.addEventListener("change", applyFilters);
  filterStatusSelect.addEventListener("change", applyFilters);

  const customControlContainer = container.querySelector(
    "#custom-layer-control",
  );

  const addLayerToCustomPanel = (mapInstance, layer, nama) => {
    if (!customControlContainer) return;
    const label = document.createElement("label");
    label.className = "flex items-center space-x-2 text-sm";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) layer.addTo(mapInstance);
      else mapInstance.removeLayer(layer);
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(nama));
    customControlContainer.appendChild(label);
  };

  addLayerToCustomPanel(map, layers.kecamatan, "Kecamatan");
  addLayerToCustomPanel(map, layers.desa, "Desa");
  addLayerToCustomPanel(map, layers.zonasi, "Zonasi");
  addLayerToCustomPanel(map, layers.rdtr, "RDTR");
  addLayerToCustomPanel(map, layers.pemetaan, "Pemetaan");
  addLayerToCustomPanel(map, layers.kkpr, "KKPR");

  loadActiveLayerGIS(map, addLayerToCustomPanel, addPopupAndHover);
}

async function loadActiveLayerGIS(
  map,
  addLayerToCustomPanel,
  addPopupAndHover,
) {
  try {
    const resp = await axiosInstance.get("/gis/layers/", {
      params: { aktif: true },
    });
    const results = resp.data.results || resp.data;

    for (const layerData of results) {
      if (layerData.geometry) {
        try {
          const layer = L.geoJSON(layerData.geometry, {
            style: {
              color: layerData.warna || "#3388ff",
              opacity: layerData.opacity || 1.0,
              fillOpacity: (layerData.opacity || 1.0) * 0.5,
            },
            onEachFeature: (feature, layer) => {
              addPopupAndHover(
                layer,
                `<strong>${layerData.nama_layer}</strong>`,
              );
            },
          }).addTo(map);
          if (window.layerControl)
            window.layerControl.addOverlay(layer, layerData.nama_layer);
          addLayerToCustomPanel(map, layer, layerData.nama_layer);
        } catch (geomError) {
          console.error(
            `Gagal memuat geometry layer ${layerData.nama_layer}:`,
            geomError,
          );
        }
      } else if (layerData.file_geojson) {
        try {
          const url = layerData.file_geojson;
          const token = localStorage.getItem("access_token");
          const fetchOptions = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
          const response = await fetch(url, fetchOptions);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const geojson = await response.json();
          const layer = L.geoJSON(geojson, {
            style: {
              color: layerData.warna || "#3388ff",
              opacity: layerData.opacity || 1.0,
              fillOpacity: (layerData.opacity || 1.0) * 0.5,
            },
            onEachFeature: (feature, layer) => {
              const props = feature.properties || {};
              const content =
                `<strong>${layerData.nama_layer}</strong><br>` +
                Object.entries(props)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join("<br>");
              addPopupAndHover(layer, content);
            },
          }).addTo(map);
          if (window.layerControl)
            window.layerControl.addOverlay(layer, layerData.nama_layer);
          addLayerToCustomPanel(map, layer, layerData.nama_layer);
        } catch (fileError) {
          console.error(
            `Gagal memuat file GeoJSON layer ${layerData.nama_layer}:`,
            fileError,
          );
        }
      }
    }
  } catch (error) {
    console.error("Gagal memuat daftar layer GIS:", error);
  }
}
