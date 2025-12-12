// @/ui/dispatcher_ui/routes_logging.tsx
import { AudioLogEntry } from "@/app/dispatcher/page";
import { Check, AlertCircle } from "lucide-react";

type LoggingTableProps = {
  logs: AudioLogEntry[];
};

export default function LoggingTable({ logs }: LoggingTableProps) {
  return (
    <div className="divide-y divide-gray-200">
      {logs.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500 text-sm">
          История команд пуста
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {logs.map((log) => (
            <div key={log.id} className="p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        log.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : log.status === "sending"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status === "sent"
                        ? "Доставлено"
                        : log.status === "sending"
                        ? "Отправляется"
                        : "Ошибка отправки"}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID команды: {log.id}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900">
                    Маршрут #{log.routeId}
                  </p>

                  <audio
                    src={log.audioUrl}
                    controls
                    className="w-full mt-2 h-8"
                    onEnded={() => URL.revokeObjectURL(log.audioUrl)}
                  />
                </div>

                <div className="text-right ml-3">
                  <time className="text-xs text-gray-500 block">
                    {log.timestamp.toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  <time className="text-xs text-gray-400 block">
                    {log.timestamp.toLocaleDateString("ru-RU")}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
