export default function Login() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-800">SI-PETARUNG MALAKA</h1>
            <p class="text-gray-600 text-sm">SISTEM INFORMASI PEMANFAATAN RUANG KABUPATEN MALAKA</p>
          </div>
          <form id="login-form" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Username / Email</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="Masukkan username atau email"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="Masukkan password"
              />
            </div>
            <div>
              <button
                type="submit"
                id="login-btn"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Masuk
              </button>
            </div>
          </form>
          <div class="mt-6 text-center">
            <a href="/" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              &larr; Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
