export default function Home() {
  return `
    <div class="min-h-screen bg-gray-100">
      <!-- Header Transparan -->
      <header class="absolute top-0 left-0 right-0 z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <img src="/icons/icon.png" alt="Logo" class="w-10 h-10 rounded-full bg-white shadow" />
            <div class="text-white drop-shadow-lg">
              <h1 class="text-lg font-bold leading-tight">SI-PETARUNG MALAKA</h1>
              <p class="text-xs text-blue-100">Sistem Informasi Penataan Ruang Kabupaten Malaka</p>
            </div>
          </div>
          <a href="/login" class="bg-white/90 hover:bg-white text-blue-900 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow">Login</a>
        </div>
      </header>

      <!-- Hero Section dengan Background Foto -->
      <section class="relative h-screen flex items-center justify-center bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80');">
        <div class="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-800/60"></div>
        <div class="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <img src="/icons/icon.png" alt="Logo" class="w-24 h-24 mx-auto mb-6 rounded-full shadow-xl" />
          <h2 class="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">SI-PETARUNG MALAKA</h2>
          <p class="text-lg md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto drop-shadow">
            Sistem Informasi Penataan Ruang Kabupaten Malaka untuk pengelolaan KKPR, verifikasi spasial, pemetaan, dan monitoring tata ruang secara terintegrasi.
          </p>
          <a href="/login" class="inline-block bg-white text-blue-900 font-bold px-8 py-4 rounded-lg shadow-xl hover:bg-blue-50 transition-colors text-lg">
            Masuk ke Aplikasi
          </a>
        </div>
      </section>

      <!-- Fitur Utama -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 class="text-3xl font-bold text-gray-900 text-center mb-12">Fitur Utama</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div class="text-5xl mb-4">📁</div>
              <h4 class="text-xl font-semibold text-gray-900 mb-2">Manajemen KKPR</h4>
              <p class="text-gray-600">Pendataan dan administrasi permohonan KKPR secara digital.</p>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div class="text-5xl mb-4">🗺️</div>
              <h4 class="text-xl font-semibold text-gray-900 mb-2">Peta Interaktif</h4>
              <p class="text-gray-600">Visualisasi data spasial kecamatan, desa, zonasi, dan KKPR.</p>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div class="text-5xl mb-4">✅</div>
              <h4 class="text-xl font-semibold text-gray-900 mb-2">Verifikasi Spasial</h4>
              <p class="text-gray-600">Proses pengecekan dan validasi kesesuaian tata ruang.</p>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div class="text-5xl mb-4">📊</div>
              <h4 class="text-xl font-semibold text-gray-900 mb-2">Statistik & Laporan</h4>
              <p class="text-gray-600">Monitoring dan analisis data untuk pengambilan keputusan.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistik Singkat -->
      <section class="bg-blue-900 py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div class="bg-blue-800/50 p-6 rounded-xl shadow">
              <p class="text-4xl font-bold text-white">12</p>
              <p class="text-blue-100 mt-2">Kecamatan</p>
            </div>
            <div class="bg-blue-800/50 p-6 rounded-xl shadow">
              <p class="text-4xl font-bold text-white">60+</p>
              <p class="text-blue-100 mt-2">Desa/Kelurahan</p>
            </div>
            <div class="bg-blue-800/50 p-6 rounded-xl shadow">
              <p class="text-4xl font-bold text-white">3</p>
              <p class="text-blue-100 mt-2">Role Pengguna</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-sm text-gray-400">&copy; 2026 SI-PETARUNG MALAKA - Kabupaten Malaka. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `;
}
