"use client";

import React from "react";

export type Route = {
  id: number;
  team: string;
  status: "Ожидание" | "Принято";
};

type RoutesTableProps = {
  routes: Route[];
};

export default function RoutesTable({ routes }: RoutesTableProps) {
  // Ограничиваем отображение до 5 маршрутов
  const visibleRoutes = routes.slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <h2 className="text-sm font-medium text-gray-800">Список маршрутов</h2>
      </div>

      <div className="overflow-y-auto flex-1" style={{ maxHeight: "280px" }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Команда
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visibleRoutes.map((route, index) => (
              <tr key={route.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">
                  {route.team}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      route.status === "Принято"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {route.status}
                  </span>
                </td>
              </tr>
            ))}

            {/* Пустые строки для заполнения до 5 элементов */}
            {Array.from({ length: Math.max(0, 5 - visibleRoutes.length) }).map(
              (_, index) => (
                <tr key={`empty-${index}`} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-400 italic">-</td>
                  <td className="px-3 py-2 text-sm text-gray-400 italic">
                    Нет данных
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      -
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
