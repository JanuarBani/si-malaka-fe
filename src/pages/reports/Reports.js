import { kkprApi } from "../../api/kkprApi";
import { showToast } from "../../components/layout/Toast";

export default function Reports(user) {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-800">Laporan</h2>
      <div class="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
          <input type="date" id="filter-start" class="mt-1 block w-full border rounded-md px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Tanggal Akhir</label>
          <input type="date" id="filter-end" class="mt-1 block w-full border rounded-md px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Kecamatan</label>
          <select id="filter-kecamatan" class="mt-1 block w-full border rounded-md px-3 py-2">
            <option value="">Semua</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select id="filter-status" class="mt-1 block w-full border rounded-md px-3 py-2">
            <option value="">Semua</option>
            <option value="DRAFT">Draft</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="DALAM_VERIFIKASI">Dalam Verifikasi</option>
            <option value="SESUAI">Sesuai</option>
            <option value="TIDAK_SESUAI">Tidak Sesuai</option>
            <option value="TERPETAKAN">Terpetakan</option>
            <option value="SELESAI">Selesai</option>
          </select>
        </div>
        <div class="flex items-end">
          <button id="btn-filter" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Filter</button>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200" id="report-table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No KKPR</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kegiatan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pemohon</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Penerbit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kecamatan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Kegiatan</th>
            </tr>
          </thead>
          <tbody id="table-body">
            <tr><td colspan="7" class="px-4 py-6 text-center text-gray-500">Muat data...</td></tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-end space-x-3">
        <button id="btn-print" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Print</button>
        <button id="btn-csv" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Export CSV</button>
      </div>
    </div>
  `;
}

export function initReports(user) {
  let currentData = [];

  async function loadKecamatanOptions() {
    try {
      const resp = await kkprApi.getKecamatan();
      const results = resp.results || resp;
      const select = document.getElementById("filter-kecamatan");
      if (!select) return;
      results.forEach((kec) => {
        const opt = document.createElement("option");
        opt.value = kec.nama;
        opt.textContent = kec.nama;
        select.appendChild(opt);
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function applyFilter() {
    const params = { page_size: 1000 };
    const kecamatan = document.getElementById("filter-kecamatan").value;
    const status = document.getElementById("filter-status").value;
    if (status) params.workflow = status;

    try {
      const data = await kkprApi.getList(params);
      let results = data.results || [];

      if (kecamatan)
        results = results.filter((r) => r.kecamatan_nama === kecamatan);

      const startDate = document.getElementById("filter-start").value;
      const endDate = document.getElementById("filter-end").value;
      if (startDate)
        results = results.filter(
          (r) => r.tanggal_penerbit && r.tanggal_penerbit >= startDate,
        );
      if (endDate)
        results = results.filter(
          (r) => r.tanggal_penerbit && r.tanggal_penerbit <= endDate,
        );

      currentData = results;
      renderTable(results);
    } catch (error) {
      showToast("Gagal memuat data", "error");
    }
  }

  function renderTable(results) {
    const tbody = document.getElementById("table-body");
    if (!tbody) return;
    if (results.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="px-4 py-6 text-center text-gray-500">Tidak ada data.</td></tr>';
      return;
    }
    tbody.innerHTML = results
      .map(
        (r) => `
      <tr>
        <td class="px-4 py-3 text-sm">${r.no_kkpr}</td>
        <td class="px-4 py-3 text-sm">${r.nama_kegiatan}</td>
        <td class="px-4 py-3 text-sm">${r.pemohon}</td>
        <td class="px-4 py-3 text-sm">${r.tanggal_penerbit || "-"}</td>
        <td class="px-4 py-3 text-sm">${r.kecamatan_nama || "-"}</td>
        <td class="px-4 py-3 text-sm">${r.workflow}</td>
        <td class="px-4 py-3 text-sm">${r.jenis_kegiatan}</td>
      </tr>
    `,
      )
      .join("");
  }

  function exportCSV() {
    if (currentData.length === 0) {
      showToast("Tidak ada data untuk diekspor", "warning");
      return;
    }
    const headers = [
      "No KKPR",
      "Nama Kegiatan",
      "Pemohon",
      "Tanggal Penerbit",
      "Kecamatan",
      "Status",
      "Jenis Kegiatan",
    ];
    const rows = currentData.map((r) => [
      r.no_kkpr,
      r.nama_kegiatan,
      r.pemohon,
      r.tanggal_penerbit || "",
      r.kecamatan_nama || "",
      r.workflow,
      r.jenis_kegiatan,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "laporan_kkpr.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  document.getElementById("btn-filter")?.addEventListener("click", applyFilter);

  document.getElementById("btn-print")?.addEventListener("click", () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      "<html><head><title>Laporan KKPR</title></head><body>",
    );
    printWindow.document.write(
      document.getElementById("report-table").outerHTML,
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  });

  document.getElementById("btn-csv")?.addEventListener("click", exportCSV);

  loadKecamatanOptions();
  applyFilter();
}
