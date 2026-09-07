export default function Topbar(user) {
  return `
    <header class="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6">
      <div class="flex items-center">
        <button id="open-sidebar" class="md:hidden text-gray-500 hover:text-gray-700 mr-2">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-800 hidden sm:block">Dashboard</h1>
      </div>
      <div class="flex items-center space-x-3">
        <span class="hidden md:block text-sm text-gray-600">${user?.nama_lengkap || "User"}</span>
        <button id="logout-btn" class="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-colors">Logout</button>
      </div>
    </header>
  `;
}
