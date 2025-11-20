type Route = {
  id: number;
  team: string;
  status: "Ожидание" | "Принято";
};

const routesData: Route[] = [
  { id: 1, team: "Отправляйтесь", status: "Ожидание" },
  { id: 2, team: "Оставайтесь на станции", status: "Принято" },
  {
    id: 3,
    team: "Выпускайте пассажиров и едьте на ремонт",
    status: "Ожидание",
  },
  { id: 4, team: "Всё ок", status: "Принято" },
];

export default async function Page() {
  <div className="max-w-2xl mx-auto p-6 bg-black rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4 text-center">Список маршрутов</h2>

    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 rounded-tl-lg rounded-bl-lg">
              N
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
              Команда
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 rounded-tr-lg rounded-br-lg">
              Статус
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-3 text-sm text-gray-900">1</td>
            <td className="px-4 py-3 text-sm text-gray-900">Команда А</td>
            <td className="px-4 py-3 text-sm text-gray-900">Активен</td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-3 text-sm text-gray-900">2</td>
            <td className="px-4 py-3 text-sm text-gray-900">Команда Б</td>
            <td className="px-4 py-3 text-sm text-gray-900">Завершен</td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-3 text-sm text-gray-900">3</td>
            <td className="px-4 py-3 text-sm text-gray-900">Команда В</td>
            <td className="px-4 py-3 text-sm text-gray-900">В ожидании</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>;
}
