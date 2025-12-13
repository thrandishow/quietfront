import { LogEntry } from "@/app/types/dispatcher"; // Импортируем обновленный тип
import { MessageSquare, AlertCircle } from "lucide-react";

type LoggingTableProps = {
  logs: LogEntry[];
};

export default function LoggingTable({ logs }: LoggingTableProps) {
  return (
    <div className="flex flex-col h-full">
      {logs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          История команд пуста
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                {/* ID Маршрута */}
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                    Маршрут #{log.routeId}
                  </span>
                  {log.isError && (
                    <span className="text-red-500 text-xs flex items-center">
                      <AlertCircle size={12} className="mr-1" /> Ошибка
                    </span>
                  )}
                </div>

                {/* Время */}
                <time className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {log.timestamp.toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </time>
              </div>

              {/* Текст ответа сервера */}
              <div
                className={`text-sm mt-1 leading-relaxed ${
                  log.isError ? "text-red-600" : "text-gray-800"
                }`}
              >
                {log.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
