import { dokumenApi } from "../../api/dokumenApi";
import { kkprApi } from "../../api/kkprApi";
import { showToast } from "../../components/layout/Toast";

export default function DocumentsList(user) {
  const role = user.role;
  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">Dokumen</h2>
        ${role === "ADMIN" ? '<button id="btn-add-document" class="px-4 py-2 bg-blue-600 text-white rounded-md">+ Upload Dokumen</button>' : ""}
      </div>
      <div class="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
        <input id="search-doc" type="text" placeholder="Cari nama dokumen atau no KKPR..." class="flex-1 border rounded-md px-3 py-2">
        <select id="filter-kkpr" class="border rounded-md px-3 py-2">
          <option value="">Semua KKPR</option>
        </select>
        <select id="filter-kategori" class="border rounded-md px-3 py-2">
          <option value="">Semua Kategori</option>
          <option value="LEGALITAS">Legalitas</option>
          <option value="SPASIAL">Spasial</option>
          <option value="LAINNYA">Lainnya</option>
        </select>
        <button id="btn-filter-doc" class="bg-gray-800 text-white px-4 py-2 rounded-md">Filter</button>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Dokumen</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No KKPR</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengunggah</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody id="doc-table-body">
            <tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>
      <!-- Modal Upload -->
      <div id="doc-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Upload Dokumen</h3>
            <button id="btn-close-doc-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <form id="doc-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Pilih KKPR</label>
              <select name="kkpr" required class="mt-1 block w-full border rounded-md px-3 py-2">
                <option value="">Pilih KKPR</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nama Dokumen</label>
              <input type="text" name="nama_dokumen" required class="mt-1 block w-full border rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Kategori</label>
              <select name="kategori" class="mt-1 block w-full border rounded-md px-3 py-2">
                <option value="LEGALITAS">Legalitas</option>
                <option value="SPASIAL">Spasial</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">File</label>
              <input type="file" name="file" required class="mt-1 block w-full text-sm">
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" id="btn-cancel-doc" class="px-4 py-2 border rounded-md text-gray-700">Batal</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Upload</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function initDocumentsList(user) {
  const role = user.role;
  let currentKKPR = "";
  let currentKategori = "";
  let searchTerm = "";

  async function loadKKPROptions() {
    try {
      const data = await kkprApi.getList({ page_size: 100 });
      const results = data.results || data;
      const selectFilter = document.getElementById("filter-kkpr");
      const selectModal = document.querySelector(
        '#doc-form select[name="kkpr"]',
      );
      if (selectFilter) {
        results.forEach((item) => {
          const opt = document.createElement("option");
          opt.value = item.id;
          opt.textContent = item.no_kkpr;
          selectFilter.appendChild(opt);
        });
      }
      if (selectModal) {
        results.forEach((item) => {
          const opt = document.createElement("option");
          opt.value = item.id;
          opt.textContent = item.no_kkpr;
          selectModal.appendChild(opt);
        });
      }
    } catch (error) {
      console.error("Gagal memuat KKPR", error);
    }
  }

  async function loadDocuments() {
    const tbody = document.getElementById("doc-table-body");
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>';
    const params = { page_size: 100 };
    if (searchTerm) params.search = searchTerm;
    if (currentKKPR) params.kkpr = currentKKPR;
    if (currentKategori) params.kategori = currentKategori;

    try {
      const data = await dokumenApi.getList(params);
      const results = data.results || data;
      if (results.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Tidak ada dokumen.</td></tr>';
      } else {
        tbody.innerHTML = results
          .map(
            (doc) => `
          <tr>
            <td class="px-4 py-3 text-sm">${doc.nama_dokumen}</td>
            <td class="px-4 py-3 text-sm">${doc.kkpr_no}</td>
            <td class="px-4 py-3 text-sm">${doc.kategori}</td>
            <td class="px-4 py-3 text-sm">${doc.pengunggah_nama || "-"}</td>
            <td class="px-4 py-3 text-sm">${new Date(doc.tanggal_upload).toLocaleDateString("id-ID")}</td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <a href="${doc.file}" target="_blank" class="text-blue-600 hover:underline">Lihat</a>
              ${role === "ADMIN" ? ` | <button data-id="${doc.id}" class="text-red-600 hover:underline btn-delete-doc">Hapus</button>` : ""}
            </td>
          </tr>
        `,
          )
          .join("");
        tbody.querySelectorAll(".btn-delete-doc").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const docId = e.target.getAttribute("data-id");
            if (confirm("Hapus dokumen ini?")) {
              try {
                await dokumenApi.delete(docId);
                showToast("Dokumen dihapus", "success");
                loadDocuments();
              } catch (error) {
                showToast("Gagal menghapus dokumen", "error");
              }
            }
          });
        });
      }
    } catch (error) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="px-4 py-6 text-center text-red-500">Gagal memuat data.</td></tr>';
      showToast("Gagal memuat dokumen", "error");
    }
  }

  // Event listeners
  document.getElementById("btn-filter-doc")?.addEventListener("click", () => {
    searchTerm = document.getElementById("search-doc").value.trim();
    currentKKPR = document.getElementById("filter-kkpr").value;
    currentKategori = document.getElementById("filter-kategori").value;
    loadDocuments();
  });

  document.getElementById("search-doc")?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") document.getElementById("btn-filter-doc").click();
  });

  // Modal
  const modal = document.getElementById("doc-modal");
  const btnAdd = document.getElementById("btn-add-document");
  const btnClose = document.getElementById("btn-close-doc-modal");
  const btnCancel = document.getElementById("btn-cancel-doc");
  const form = document.getElementById("doc-form");

  if (btnAdd && modal) {
    btnAdd.addEventListener("click", () => modal.classList.remove("hidden"));
  }
  btnClose?.addEventListener("click", () => modal.classList.add("hidden"));
  btnCancel?.addEventListener("click", () => modal.classList.add("hidden"));

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    try {
      await dokumenApi.create(formData);
      showToast("Dokumen berhasil diupload", "success");
      form.reset();
      modal.classList.add("hidden");
      loadDocuments();
    } catch (error) {
      console.error(error);
      showToast("Gagal upload dokumen", "error");
    }
  });

  // Inisialisasi
  loadKKPROptions();
  loadDocuments();
}
