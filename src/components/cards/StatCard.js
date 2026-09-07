export default function StatCard({
  title,
  value,
  icon,
  color = "bg-blue-500",
}) {
  return `
    <div class="bg-white rounded-lg shadow p-5 flex items-center">
      <div class="flex-shrink-0 h-12 w-12 ${color} rounded-md flex items-center justify-center text-white text-2xl">
        ${icon || "📊"}
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium text-gray-500">${title}</p>
        <p class="text-2xl font-bold text-gray-800">${value}</p>
      </div>
    </div>
  `;
}
