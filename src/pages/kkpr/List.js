import { kkprApi } from "../../api/kkprApi";
import { showToast } from "../../components/layout/Toast";

export default function KKPRList(user) {
  const role = user.role;
  return `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-2xl font-bold text-gray-800">Data KKPR</h2>
        ${role === "ADMIN" ? '<a href="/kkpr/tambah" class="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">+ Tambah KKPR</a>' : ""}
      </div>
      <div class="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
        <input id="search-input" type="text" placeholder="Cari No KKPR, Nama Kegiatan, Pemohon..." class="flex-1 border rounded-md px-3 py-2">
        <select id="filter-workflow" class="border rounded-md px-3 py-2">
          <option value="">Semua Workflow</option>
          <option value="DRAFT">Draft</option>
          <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
          <option value="DALAM_VERIFIKASI">Dalam Verifikasi</option>
          <option value="SESUAI">Sesuai</option>
          <option value="TIDAK_SESUAI">Tidak Sesuai</option>
          <option value="TERPETAKAN">Terpetakan</option>
          <option value="BERSYARAT">Bersyarat</option>
          <option value="SELESAI">Selesai</option>
        </select>
        <select id="filter-status" class="border rounded-md px-3 py-2">
          <option value="">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="NONAKTIF">Nonaktif</option>
        </select>
        <select id="filter-kecamatan" class="border rounded-md px-3 py-2">
          <option value="">Semua Kecamatan</option>
        </select>
        <button id="btn-search" class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md">Filter</button>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No KKPR</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kegiatan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pemohon</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kecamatan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desa</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody id="table-body" class="bg-white divide-y divide-gray-200">
            <tr><td colspan="7" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between">
        <span id="pagination-info" class="text-sm text-gray-600"></span>
        <div class="space-x-2">
          <button id="btn-prev" class="px-3 py-1 border rounded disabled:opacity-50" disabled>Prev</button>
          <button id="btn-next" class="px-3 py-1 border rounded disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  `;
}

export function initKKPRList(user) {
  console.log("initKKPRList dipanggil");
  const role = user.role;
  let currentPage = 1;
  let searchTerm = "";
  let filterWorkflow = "";
  let filterStatus = "";
  let filterKecamatan = "";
  let totalCount = 0;
  let nextPage = null;
  let prevPage = null;

  const loadKecamatan = async () => {
    try {
      const data = await kkprApi.getKecamatan();
      const results = data.results || data;
      const select = document.getElementById("filter-kecamatan");
      if (!select) return;
      results.forEach((kec) => {
        const option = document.createElement("option");
        option.value = kec.id;
        option.textContent = kec.nama;
        select.appendChild(option);
      });
    } catch (error) {
      console.error("Gagal memuat kecamatan", error);
    }
  };

  const renderRow = (item) => {
    let actions = `<a href="/kkpr/${item.id}" class="text-blue-600 hover:underline">Detail</a>`;
    if (role === "ADMIN" || role === "OPERATOR_GIS") {
      actions += ` | <a href="/kkpr/edit/${item.id}" class="text-green-600 hover:underline">Edit</a>`;
    }
    if (role === "ADMIN") {
      actions += ` | <button data-id="${item.id}" class="text-red-600 hover:underline btn-delete">Hapus</button>`;
    }
    const workflowBadge = {
      SESUAI: "bg-green-100 text-green-800",
      TIDAK_SESUAI: "bg-red-100 text-red-800",
      MENUNGGU_VERIFIKASI: "bg-yellow-100 text-yellow-800",
      TERPETAKAN: "bg-blue-100 text-blue-800",
      SELESAI: "bg-purple-100 text-purple-800",
      DRAFT: "bg-gray-100 text-gray-800",
      DALAM_VERIFIKASI: "bg-indigo-100 text-indigo-800",
      BERSYARAT: "bg-orange-100 text-orange-800",
    };
    const badgeClass =
      workflowBadge[item.workflow] || "bg-gray-100 text-gray-800";
    return `
      <tr>
        <td class="px-4 py-3 text-sm">${item.no_kkpr}</td>
        <td class="px-4 py-3 text-sm">${item.nama_kegiatan}</td>
        <td class="px-4 py-3 text-sm">${item.pemohon}</td>
        <td class="px-4 py-3 text-sm">${item.kecamatan_nama || "-"}</td>
        <td class="px-4 py-3 text-sm">${item.desa_nama || "-"}</td>
        <td class="px-4 py-3 text-sm"><span class="px-2 py-1 text-xs rounded-full ${badgeClass}">${item.workflow}</span></td>
        <td class="px-4 py-3 text-sm whitespace-nowrap">${actions}</td>
      </tr>
    `;
  };

  const loadData = async () => {
    const tbody = document.getElementById("table-body");
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="7" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>';
    const params = { page: currentPage, search: searchTerm };
    if (filterWorkflow) params.workflow = filterWorkflow;
    if (filterStatus) params.status = filterStatus;
    if (filterKecamatan) params.kecamatan = filterKecamatan;

    try {
      const data = await kkprApi.getList(params);
      totalCount = data.count;
      nextPage = data.next;
      prevPage = data.previous;
      const results = data.results || [];

      if (results.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="7" class="px-4 py-6 text-center text-gray-500">Tidak ada data.</td></tr>';
      } else {
        tbody.innerHTML = results.map(renderRow).join("");
      }

      const start = (currentPage - 1) * 20 + 1;
      const end = Math.min(start + results.length - 1, totalCount);
      const paginationInfo = document.getElementById("pagination-info");
      if (paginationInfo)
        paginationInfo.textContent = `Menampilkan ${start}-${end} dari ${totalCount}`;
      const btnPrev = document.getElementById("btn-prev");
      const btnNext = document.getElementById("btn-next");
      if (btnPrev) btnPrev.disabled = !prevPage;
      if (btnNext) btnNext.disabled = !nextPage;

      // Attach delete events
      document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Yakin ingin menghapus data ini?")) {
            try {
              await kkprApi.delete(id);
              showToast("Data berhasil dihapus", "success");
              loadData();
            } catch (error) {
              showToast("Gagal menghapus data", "error");
            }
          }
        });
      });
    } catch (error) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="px-4 py-6 text-center text-red-500">Gagal memuat data.</td></tr>';
      showToast("Gagal memuat data KKPR", "error");
    }
  };

  // Event listeners
  document.getElementById("btn-search")?.addEventListener("click", () => {
    searchTerm = document.getElementById("search-input").value.trim();
    filterWorkflow = document.getElementById("filter-workflow").value;
    filterStatus = document.getElementById("filter-status").value;
    filterKecamatan = document.getElementById("filter-kecamatan").value;
    currentPage = 1;
    loadData();
  });

  document.getElementById("search-input")?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") document.getElementById("btn-search").click();
  });

  document.getElementById("btn-prev")?.addEventListener("click", () => {
    if (prevPage) {
      currentPage--;
      loadData();
    }
  });

  document.getElementById("btn-next")?.addEventListener("click", () => {
    if (nextPage) {
      currentPage++;
      loadData();
    }
  });

  // Inisialisasi
  loadKecamatan();
  loadData();
}
