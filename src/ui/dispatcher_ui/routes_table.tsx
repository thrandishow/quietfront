"use client";

import { Route } from "@/app/types/dispatcher"; // Лучше брать тип из общего файла

type RoutesTableProps = {
  routes: Route[];
  selectedRouteId: number | null;
  onRouteSelect: (route: Route) => void;
};

export default function RoutesTable({
  routes,
  selectedRouteId,
  onRouteSelect,
}: RoutesTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            ID
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Команда
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Статус
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {routes.map((route) => (
          <tr
            key={route.id}
            onClick={() => onRouteSelect(route)}
            className={`cursor-pointer transition-colors ${
              selectedRouteId === route.id
                ? "bg-blue-50 border-l-4 border-blue-500"
                : "hover:bg-gray-50 border-l-4 border-transparent"
            }`}
          >
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
              #{route.id}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
              {route.team}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  route.status === "Принято"
                    ? "bg-green-100 text-green-800"
                    : route.status === "Отправлено"
                    ? "bg-blue-100 text-blue-800" // Синий обычно лучше подходит для "Sent"
                    : "bg-gray-100 text-gray-800" // Серый или Красный для ожидания
                }`}
              >
                {route.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
