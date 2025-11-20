import RoutesTable, { Route } from "@/ui/dispatcher_ui/routes_table";
import Navbar from "@/ui/navbar";
import ButtonMicro from "@/ui/dispatcher_ui/button_micro";
import ButtonSend from "@/ui/dispatcher_ui/button_send";
import LoggingTable from "@/ui/dispatcher_ui/routes_logging";

async function getRoutesData() {
  "use server";
  // Здесь можно делать запрос к API или базе данных
  return [
    { id: 1, team: "Отправляйтесь", status: "Ожидание" },
    { id: 2, team: "Оставайтесь на станции", status: "Принято" },
    {
      id: 3,
      team: "Выпускайте пассажиров и едьте на ремонт",
      status: "Ожидание",
    },
    { id: 4, team: "Всё ок", status: "Принято" },
  ];
}

export default async function DispatcherPage() {
  const routes = await getRoutesData();
  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Левая колонка: Микрофон */}
          <div className="flex flex-col items-center justify-start pt-8">
            <div className="w-full bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
              <ButtonMicro />
            </div>
          </div>

          {/* Центральная колонка: Таблица маршрутов + кнопка */}
          <div className="flex flex-col">
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm mb-4 flex-1">
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-center text-gray-800">
                  Список маршрутов
                </h2>
              </div>
              <div className="p-4 overflow-y-auto max-h-[450px]">
                <RoutesTable routes={routes as Route[]} />
              </div>
            </div>
            <div className="mt-2">
              <ButtonSend />
            </div>
          </div>

          {/* Правая колонка: Таблица команд (увеличенная высота) */}
          <div className="flex flex-col">
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm mb-4 flex-1 flex flex-col">
              <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
                <LoggingTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
