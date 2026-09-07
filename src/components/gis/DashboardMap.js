import L from "leaflet";

export function initDashboardMap(containerId, options = {}) {
  const mapElement = document.getElementById(containerId);
  if (!mapElement || mapElement._leaflet_id) return;

  const map = L.map(mapElement).setView([-9.5, 124.8], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

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

  const createIcon = (no_kkpr, workflow) => {
    const bgColor = getColorByWorkflow(workflow);
    return L.divIcon({
      className: "kkpr-marker",
      html: `
        <div style="
          background-color: ${bgColor};
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          box-shadow: 0 0 6px rgba(0,0,0,0.5);
          border: 2px solid white;
          cursor: pointer;
        ">
          ${no_kkpr.split(" ").pop() || "KKPR"}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -20],
    });
  };

  const loadLayers = async () => {
    try {
      const authHeaders = {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };

      // Muat layer kecamatan terlebih dahulu agar berada di belakang marker
      if (options.showKecamatan) {
        const kecRes = await fetch("/api/gis/kecamatan/geojson/", {
          headers: authHeaders,
        });
        if (kecRes.ok) {
          const kecGeoJSON = await kecRes.json();
          L.geoJSON(kecGeoJSON, {
            style: { color: "#3388ff", weight: 2, fillOpacity: 0.1 },
            interactive: false, // penting: agar tidak menghalangi klik/hover marker
          }).addTo(map);
        }
      }

      // Muat layer KKPR (marker) di atas layer kecamatan
      const kkprRes = await fetch("/api/kkpr/kkpr/geojson/", {
        headers: authHeaders,
      });
      if (!kkprRes.ok) throw new Error("Gagal memuat GeoJSON KKPR");
      const kkprGeoJSON = await kkprRes.json();

      const kkprLayer = L.geoJSON(kkprGeoJSON, {
        pointToLayer: (feature, latlng) => {
          const p = feature.properties || {};
          const icon = createIcon(p.no_kkpr || "KKPR", p.workflow);
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
                Status: <span style="color: ${getColorByWorkflow(p.workflow)}; font-weight: bold;">${p.workflow}</span>
              </div>
            `;
            layer.bindPopup(popupContent);

            // Event hover
            layer.on("mouseover", () => {
              layer.openPopup();
            });
            layer.on("mouseout", () => {
              layer.closePopup();
            });
            // Event klik (toggle)
            layer.on("click", () => {
              if (layer.isPopupOpen()) {
                layer.closePopup();
              } else {
                layer.openPopup();
              }
            });
          }
        },
      }).addTo(map);

      // Simpan referensi marker
      const markers = [];
      kkprLayer.eachLayer((layer) => {
        if (layer instanceof L.Marker) markers.push(layer);
      });

      // Buka popup pertama otomatis setelah peta siap
      if (markers.length > 0 && options.openFirstPopup !== false) {
        setTimeout(() => {
          markers[0].openPopup();
        }, 300);
      }
    } catch (error) {
      console.error("Gagal memuat peta dashboard:", error);
    }
  };

  loadLayers();
  return map;
}
