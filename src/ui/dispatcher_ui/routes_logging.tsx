// @/ui/dispatcher_ui/routes_logging.tsx
import { LogEntry } from "@/app/dispatcher/page";
import { Check, AlertCircle, Info } from "lucide-react";

type LoggingTableProps = {
  logs: LogEntry[];
};

export default function LoggingTable({ logs }: LoggingTableProps) {
  return (
    <div className="divide-y divide-gray-200">
      {logs.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500 text-sm">
          Журнал событий пуст
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {logs.map((log) => (
            <div key={log.id} className="p-3 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {log.type === "success" && (
                    <Check size={16} className="text-green-500" />
                  )}
                  {log.type === "error" && (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                  {log.type === "info" && (
                    <Info size={16} className="text-blue-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {log.message}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    {log.routeId > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                        Маршрут #{log.routeId}
                      </span>
                    )}

                    <time className="text-gray-500">
                      {log.timestamp.toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
