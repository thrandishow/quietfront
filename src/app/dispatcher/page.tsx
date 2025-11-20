"use client";

import RoutesTable, { Route } from "@/ui/dispatcher_ui/routes_table";
import Navbar from "@/ui/navbar";
import ButtonMicro from "@/ui/dispatcher_ui/button_micro";
import ButtonSend from "@/ui/dispatcher_ui/button_send";
import LoggingTable from "@/ui/dispatcher_ui/routes_logging";
import SelectedRouteDisplay from "@/ui/dispatcher_ui/selected_route";
import { useState, useEffect } from "react";

// Вспомогательная функция для валидации статуса
function validateStatus(status: string): "Ожидание" | "Принято" {
  return status === "Принято" ? "Принято" : "Ожидание";
}

async function getRoutesData(): Promise<Route[]> {
  // Данные для демонстрации
  const rawData = [
    { id: 1, team: "Отправляйтесь", status: "Ожидание" },
    { id: 2, team: "Оставайтесь на станции", status: "Принято" },
    {
      id: 3,
      team: "Выпускайте пассажиров и едьте на ремонт",
      status: "Ожидание",
    },
    { id: 4, team: "Всё ок", status: "Принято" },
    { id: 5, team: "Эвакуация с центральной станции", status: "Ожидание" },
    { id: 6, team: "Тестовый маршрут для проверки", status: "Принято" },
    { id: 7, team: "Дополнительная команда для теста", status: "Ожидание" },
  ];

  // Валидируем и преобразуем данные к типу Route
  return rawData.map((route) => ({
    ...route,
    status: validateStatus(route.status),
  }));
}

export default function DispatcherPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getRoutesData();
        setRoutes(data);
      } catch (error) {
        console.error("Failed to fetch routes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0]);
    }
  }, [routes, selectedRoute]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Основной контейнер с двумя колонками */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Левая колонка: Кнопки + Список маршрутов */}
          <div className="md:col-span-3 flex flex-col gap-6">
            {/* Верхняя часть: Кнопки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <ButtonMicro />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <ButtonSend />
              </div>
            </div>

            {/* Нижняя часть: Список маршрутов (левый нижний угол) */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">
                  Список маршрутов
                </h2>
              </div>

              <div className="overflow-y-auto">
                <RoutesTable
                  routes={routes}
                  selectedRouteId={selectedRoute?.id || null}
                  onRouteSelect={setSelectedRoute}
                />
              </div>
            </div>
          </div>

          {/* Правая колонка: Выбранный маршрут + Логи */}
          <div className="md:col-span-1 flex flex-col gap-6">
            {/* Выбранный маршрут */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <SelectedRouteDisplay selectedRoute={selectedRoute} />
            </div>

            {/* Логи */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1">
              <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                <LoggingTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
