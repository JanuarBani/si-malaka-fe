import { userApi } from "../../api/userApi";
import { showToast } from "../../components/layout/Toast";

export default function UserForm(user, id = null) {
  const isEdit = id !== null;
  return `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">${isEdit ? "Edit User" : "Tambah User"}</h2>
      <form id="user-form" class="bg-white p-6 rounded-lg shadow space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" required class="mt-1 block w-full border rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" required class="mt-1 block w-full border rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" name="nama_lengkap" class="mt-1 block w-full border rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Role</label>
            <select name="role" required class="mt-1 block w-full border rounded-md px-3 py-2">
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR_GIS">Operator GIS</option>
              <option value="PIMPINAN">Pimpinan</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Jabatan</label>
            <input type="text" name="jabatan" class="mt-1 block w-full border rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" class="mt-1 block w-full border rounded-md px-3 py-2">
              <option value="AKTIF">Aktif</option>
              <option value="NONAKTIF">Nonaktif</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Uraian Tugas</label>
            <textarea name="uraian_tugas" rows="2" class="mt-1 block w-full border rounded-md px-3 py-2"></textarea>
          </div>
          ${
            !isEdit
              ? `
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" required minlength="8" class="mt-1 block w-full border rounded-md px-3 py-2">
            <p class="text-xs text-gray-500 mt-1">Minimal 8 karakter.</p>
          </div>
          `
              : ""
          }
          ${
            isEdit
              ? `
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Reset Password (opsional)</label>
            <input type="password" name="password" placeholder="Kosongkan jika tidak ingin mengubah" class="mt-1 block w-full border rounded-md px-3 py-2">
          </div>
          `
              : ""
          }
        </div>
        <div class="flex justify-end space-x-3">
          <a href="/users" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Batal</a>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">${isEdit ? "Simpan Perubahan" : "Tambah User"}</button>
        </div>
      </form>
    </div>
  `;
}

export function initUserForm(user, id = null) {
  const isEdit = id !== null;
  const form = document.getElementById("user-form");
  if (!form) return;

  if (isEdit) {
    const loadData = async () => {
      try {
        const data = await userApi.getDetail(id);
        form.username.value = data.username;
        form.email.value = data.email;
        form.nama_lengkap.value = data.nama_lengkap || "";
        form.role.value = data.role;
        form.jabatan.value = data.jabatan || "";
        form.status.value = data.status;
        form.uraian_tugas.value = data.uraian_tugas || "";
      } catch (error) {
        showToast("Gagal memuat data user", "error");
      }
    };
    loadData();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      username: form.username.value,
      email: form.email.value,
      nama_lengkap: form.nama_lengkap.value || "",
      role: form.role.value,
      jabatan: form.jabatan.value || "",
      status: form.status.value,
      uraian_tugas: form.uraian_tugas.value || "",
    };
    if (form.password.value) {
      payload.password = form.password.value;
    }
    try {
      if (isEdit) {
        await userApi.update(id, payload);
        showToast("User berhasil diperbarui", "success");
      } else {
        await userApi.create(payload);
        showToast("User berhasil ditambahkan", "success");
      }
      window.location.href = "/users";
    } catch (error) {
      console.error(error);
      let message = "Gagal menyimpan user";
      if (error.response?.data) message = JSON.stringify(error.response.data);
      showToast(message, "error");
    }
  });
}
