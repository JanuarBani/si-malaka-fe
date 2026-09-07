import { kkprApi } from "../../api/kkprApi";
import { showToast } from "../../components/layout/Toast";

export default function VerificationList(user) {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-800">Verifikasi Spasial</h2>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-gray-600">Daftar KKPR yang menunggu verifikasi spasial.</p>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No KKPR</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kegiatan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pemohon</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kecamatan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody id="verification-table-body">
            <tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function initVerificationList(user) {
  const loadData = async () => {
    const tbody = document.getElementById("verification-table-body");
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>';
    try {
      const data = await kkprApi.getList({ workflow: "MENUNGGU_VERIFIKASI" });
      console.log("Data verifikasi:", data); // debug
      const results = data.results || data;
      if (results.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Tidak ada data menunggu verifikasi.</td></tr>';
        return;
      }
      tbody.innerHTML = results
        .map(
          (item) => `
        <tr>
          <td class="px-4 py-3 text-sm">${item.no_kkpr}</td>
          <td class="px-4 py-3 text-sm">${item.nama_kegiatan}</td>
          <td class="px-4 py-3 text-sm">${item.pemohon}</td>
          <td class="px-4 py-3 text-sm">${item.kecamatan_nama || "-"}</td>
          <td class="px-4 py-3 text-sm"><span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">${item.workflow}</span></td>
          <td class="px-4 py-3 text-sm">
            <a href="/gis/verification/${item.id}" class="text-blue-600 hover:underline">Verifikasi</a>
          </td>
        </tr>
      `,
        )
        .join("");
    } catch (error) {
      console.error(error);
      tbody.innerHTML =
        '<tr><td colspan="6" class="px-4 py-6 text-center text-red-500">Gagal memuat data.</td></tr>';
      showToast("Gagal memuat data KKPR", "error");
    }
  };

  loadData();
}
