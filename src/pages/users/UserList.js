import { userApi } from "../../api/userApi";
import { showToast } from "../../components/layout/Toast";

export default function UserList(user) {
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Manajemen User</h2>
        <a href="/users/tambah" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Tambah User</a>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody id="user-tbody">
            <tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function initUserList(user) {
  const loadData = async () => {
    const tbody = document.getElementById("user-tbody");
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading...</td></tr>';
    try {
      const data = await userApi.getList({ page_size: 100 });
      const results = data.results || data;
      if (results.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Tidak ada user.</td></tr>';
        return;
      }
      tbody.innerHTML = results
        .map(
          (u) => `
        <tr>
          <td class="px-4 py-3 text-sm">${u.username}</td>
          <td class="px-4 py-3 text-sm">${u.nama_lengkap || "-"}</td>
          <td class="px-4 py-3 text-sm"><span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">${u.role}</span></td>
          <td class="px-4 py-3 text-sm">${u.jabatan || "-"}</td>
          <td class="px-4 py-3 text-sm">
            <span class="px-2 py-1 text-xs rounded-full ${u.status === "AKTIF" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">${u.status}</span>
          </td>
          <td class="px-4 py-3 text-sm whitespace-nowrap">
            <a href="/users/edit/${u.id}" class="text-blue-600 hover:underline">Edit</a>
            <button data-id="${u.id}" class="ml-2 text-yellow-600 hover:underline btn-toggle">${u.status === "AKTIF" ? "Nonaktifkan" : "Aktifkan"}</button>
            <button data-id="${u.id}" class="ml-2 text-purple-600 hover:underline btn-reset">Reset Password</button>
          </td>
        </tr>
      `,
        )
        .join("");

      // Toggle status
      document.querySelectorAll(".btn-toggle").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          const userData = results.find((u) => u.id == id);
          if (!userData) return;
          const newStatus = userData.status === "AKTIF" ? "NONAKTIF" : "AKTIF";
          try {
            await userApi.update(id, { status: newStatus });
            showToast(
              `User ${newStatus === "AKTIF" ? "diaktifkan" : "dinonaktifkan"}`,
              "success",
            );
            loadData();
          } catch (error) {
            showToast("Gagal mengubah status", "error");
          }
        });
      });

      // Reset password
      document.querySelectorAll(".btn-reset").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          const newPassword = prompt("Masukkan password baru:");
          if (newPassword && newPassword.length >= 8) {
            try {
              await userApi.update(id, { password: newPassword });
              showToast("Password berhasil direset", "success");
            } catch (error) {
              showToast("Gagal mereset password", "error");
            }
          } else if (newPassword !== null) {
            alert("Password minimal 8 karakter.");
          }
        });
      });
    } catch (error) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="px-4 py-6 text-center text-red-500">Gagal memuat data.</td></tr>';
      showToast("Gagal memuat user", "error");
    }
  };

  loadData();
}
