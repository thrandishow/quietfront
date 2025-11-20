"use server";

export default async function LoggingTable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Список последних команд
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Команда
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Время
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  /start
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  10:30
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  /help
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  09:45
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  /settings
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  08:20
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200">
          <button className="w-full px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
            Очистить
          </button>
        </div>
      </div>
    </div>
  );
}
