import { kkprApi } from "./kkprApi";
import { dokumenApi } from "./dokumenApi";
import { pemetaanApi } from "./gisApi";
import axiosInstance from "./axios";

export const dashboardApi = {
  async getAdminSummary() {
    const [kkprRes, dokumenRes, kecamatanRes, pemetaanRes] = await Promise.all([
      kkprApi.getList({ page_size: 1000 }),
      dokumenApi.getList({ page_size: 1000 }),
      axiosInstance.get("/gis/kecamatan/", { params: { page_size: 100 } }),
      pemetaanApi.getList({ page_size: 1000 }),
    ]);

    const kkprList = kkprRes.results || [];
    const dokumenList = dokumenRes.results || [];
    const kecamatanList = kecamatanRes.data.results || kecamatanRes.data;
    const pemetaanList = pemetaanRes.results || [];

    const summary = {
      total_kkpr: kkprList.length,
      kkpr_baru: kkprList.filter((k) => k.workflow === "DRAFT").length,
      menunggu_verifikasi: kkprList.filter(
        (k) => k.workflow === "MENUNGGU_VERIFIKASI",
      ).length,
      sudah_diverifikasi: kkprList.filter((k) =>
        ["SESUAI", "TIDAK_SESUAI", "TERPETAKAN", "SELESAI"].includes(
          k.workflow,
        ),
      ).length,
      sesuai: kkprList.filter((k) => k.workflow === "SESUAI").length,
      tidak_sesuai: kkprList.filter((k) => k.workflow === "TIDAK_SESUAI")
        .length,
      total_dokumen: dokumenList.length,
      total_kecamatan: kecamatanList.length,
      total_pemetaan: pemetaanList.length,
    };
    return summary;
  },

  async getOperatorSummary() {
    const [kkprRes, pemetaanRes, layerRes] = await Promise.all([
      kkprApi.getList({ page_size: 1000 }),
      pemetaanApi.getList({ page_size: 1000 }),
      axiosInstance.get("/gis/layers/", { params: { page_size: 100 } }),
    ]);

    const kkprList = kkprRes.results || [];
    const pemetaanList = pemetaanRes.results || [];
    const layerList = layerRes.data.results || layerRes.data;

    const summary = {
      menunggu_verifikasi: kkprList.filter(
        (k) => k.workflow === "MENUNGGU_VERIFIKASI",
      ).length,
      sudah_diverifikasi: kkprList.filter((k) =>
        ["SESUAI", "TIDAK_SESUAI", "TERPETAKAN", "SELESAI"].includes(
          k.workflow,
        ),
      ).length,
      sesuai: kkprList.filter((k) => k.workflow === "SESUAI").length,
      tidak_sesuai: kkprList.filter((k) => k.workflow === "TIDAK_SESUAI")
        .length,
      perlu_perbaikan: kkprList.filter((k) => k.workflow === "PERLU_PERBAIKAN")
        .length,
      total_pemetaan: pemetaanList.length,
      total_layer_gis: layerList.length,
    };
    return summary;
  },

  async getPimpinanSummary() {
    const [kkprRes, kecamatanRes, desaRes, pemetaanRes] = await Promise.all([
      kkprApi.getList({ page_size: 1000 }),
      axiosInstance.get("/gis/kecamatan/", { params: { page_size: 100 } }),
      axiosInstance.get("/gis/desa/", { params: { page_size: 1000 } }),
      pemetaanApi.getList({ page_size: 1000 }),
    ]);

    const kkprList = kkprRes.results || [];
    const kecamatanList = kecamatanRes.data.results || kecamatanRes.data;
    const desaList = desaRes.data.results || desaRes.data;
    const pemetaanList = pemetaanRes.results || [];

    const summary = {
      total_kkpr: kkprList.length,
      total_sesuai: kkprList.filter((k) => k.workflow === "SESUAI").length,
      total_tidak_sesuai: kkprList.filter((k) => k.workflow === "TIDAK_SESUAI")
        .length,
      menunggu_verifikasi: kkprList.filter(
        (k) => k.workflow === "MENUNGGU_VERIFIKASI",
      ).length,
      sudah_terpetakan: kkprList.filter((k) => k.workflow === "TERPETAKAN")
        .length,
      jumlah_kecamatan: kecamatanList.length,
      jumlah_desa: desaList.length,
      total_pemetaan: pemetaanList.length,
    };
    return summary;
  },

  async getAdminActivities() {
    // Ambil 5 KKPR terbaru sebagai aktivitas
    const kkprRes = await kkprApi.getList({
      page_size: 5,
      ordering: "-created_at",
    });
    const kkprList = kkprRes.results || [];

    // Ambil beberapa log aktivitas terbaru jika endpoint audit tersedia
    let auditList = [];
    try {
      const auditRes = await axiosInstance.get("/audit/", {
        params: { page_size: 5 },
      });
      auditList = auditRes.data.results || [];
    } catch (e) {
      // Audit endpoint mungkin tidak diakses oleh admin? Kita abaikan.
    }

    return {
      kkpr: kkprList,
      audit: auditList,
    };
  },
};
