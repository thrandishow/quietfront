// LoggingTable.tsx
export default function LoggingTable() {
  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <h2 className="text-sm font-medium text-gray-800">Последние команды</h2>
      </div>

      <div className="overflow-y-auto flex-1" style={{ maxHeight: "280px" }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Команда
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Время
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  /command-{i + 1}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  12:{(10 + i).toString().padStart(2, "0")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button className="w-full text-base px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium">
          Очистить
        </button>
      </div>
    </div>
  );
}
