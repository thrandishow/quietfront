// selected_route_display.tsx
"use client";

import { MapPin } from "lucide-react";

type SelectedRouteDisplayProps = {
  selectedRoute: {
    id: number;
    team: string;
    status: "Ожидание" | "Принято";
  } | null;
};

export default function SelectedRouteDisplay({
  selectedRoute,
}: SelectedRouteDisplayProps) {
  if (!selectedRoute) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">📍</div>
        <p className="text-gray-500">Выберите маршрут из списка</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-5 transition-all ${
        selectedRoute.status === "Принято"
          ? "bg-green-50 border-l-4 border-green-500"
          : "bg-red-50 border-l-4 border-red-500"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Активный маршрут
          </h3>
          <p className="text-xl font-bold text-gray-900">
            {selectedRoute.team}
          </p>

          <div className="mt-3 flex items-center text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span className="text-sm">Маршрут ID: #{selectedRoute.id}</span>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedRoute.status === "Принято"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {selectedRoute.status}
        </span>
      </div>
    </div>
  );
}
