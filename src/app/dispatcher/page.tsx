"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Check } from "lucide-react";

// UI Components
import Navbar from "@/ui/navbar";
import RoutesTable from "@/ui/dispatcher_ui/routes_table";
import ButtonMicro from "@/ui/dispatcher_ui/button_micro";
import ButtonSend from "@/ui/dispatcher_ui/button_send";
import LoggingTable from "@/ui/dispatcher_ui/routes_logging";
// Удален импорт SelectedRouteDisplay

// Logic & Utils
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { getRoutesData } from "@/app/utils/api_mock";
import { Route, LogEntry } from "@/app/types/dispatcher";

export default function DispatcherPage() {
  // --- STATE ---
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);

  // --- HOOKS ---
  const recorder = useAudioRecorder();

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- HANDLERS ---
  const addLog = useCallback(
    (text: string, routeId: number, isError: boolean = false) => {
      setLogs((prev) => [
        {
          id: Date.now(),
          timestamp: new Date(),
          text,
          routeId,
          isError,
        },
        ...prev,
      ]);
    },
    []
  );

  // --- EFFECTS ---
  useEffect(() => {
    getRoutesData()
      .then(setRoutes)
      .catch((e) => {
        console.error(e);
        addLog("Не удалось загрузить маршруты", -1, true);
      })
      .finally(() => setLoading(false));
  }, [addLog]);

  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) setSelectedRoute(routes[0]);
  }, [routes, selectedRoute]);

  // --- ФУНКЦИИ ОТПРАВКИ ---
  const sendAudioCommand = async () => {
    if (!recorder.audioBlob || !selectedRoute) return;

    abortControllerRef.current = new AbortController();
    setIsProcessing(true);
    setProcessingProgress(0);
    setRecognizedText(null);

    progressIntervalRef.current = setInterval(() => {
      setProcessingProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("id", String(selectedRoute.id));
      formData.append("file", recorder.audioBlob, `command_${Date.now()}.wav`);
      const response = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

      const result = await response.json();

      setProcessingProgress(100);
      setRecognizedText(result.text);

      // Логируем ответ
      addLog(result.text, selectedRoute.id, false);
      console.log(result)
      // 🔥 Обновляем статус маршрута на "Отправлено"
      setRoutes((prevRoutes) =>
        prevRoutes.map((route) =>
          route.id === selectedRoute.id
            ? { ...route, status: "Отправлено", team: result.text }
            : route
        )
      );

      // Обновляем текущий выбранный маршрут
      setSelectedRoute((prev) =>
        prev ? { ...prev, status: "Отправлено", team: result.text } : null
      );

      // Сброс аудио
      setTimeout(() => {
        recorder.resetAudio();
      }, 1000);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(error);
        addLog("Ошибка при обработке команды", selectedRoute.id, true);
      }
    } finally {
      setIsProcessing(false);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      abortControllerRef.current = null;
    }
  };

  const cancelProcessing = () => abortControllerRef.current?.abort();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ЛЕВАЯ КОЛОНКА (3/4 ширины) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ПАНЕЛЬ ЗАПИСИ */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Текущий маршрут:
                  </h3>
                  {/* Информация о выбранном маршруте теперь только здесь */}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-bold text-blue-600">
                      {selectedRoute?.team || "..."}
                    </p>
                    {/* Бейдж статуса */}
                    {selectedRoute && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${selectedRoute.status === "Отправлено"
                          ? "bg-blue-100 text-blue-800"
                          : selectedRoute.status === "Принято"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {selectedRoute.status}
                      </span>
                    )}
                  </div>
                </div>

                <ButtonMicro
                  isRecording={recorder.isRecording}
                  onStart={recorder.startRecording}
                  onStop={recorder.stopRecording}
                />

                {recorder.isRecording && (
                  <div className="mt-3 text-center text-red-500 font-mono">
                    {Math.floor(recorder.recordingTime / 60)}:
                    {(recorder.recordingTime % 60).toString().padStart(2, "0")}
                  </div>
                )}

                {recorder.error && (
                  <div className="mt-2 text-xs text-red-500 text-center">
                    {recorder.error}
                  </div>
                )}
              </div>

              {/* ПАНЕЛЬ ОТПРАВКИ */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Обработка
                  </h3>

                  {recorder.audioUrl && !isProcessing && (
                    <div className="mb-4">
                      <audio
                        src={recorder.audioUrl}
                        controls
                        className="w-full h-8 mb-2"
                      />
                      <div className="text-xs text-gray-500 text-right">
                        {(recorder.audioSize / 1024).toFixed(0)} KB
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Обработка...</span>
                        <span>{processingProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                      <button
                        onClick={cancelProcessing}
                        className="text-xs text-red-500 flex items-center justify-center w-full hover:underline"
                      >
                        <AlertCircle size={12} className="mr-1" /> Отменить
                      </button>
                    </div>
                  )}

                  {recognizedText && (
                    <div className="p-3 bg-green-50 text-green-800 rounded border border-green-200 text-sm flex items-start">
                      <Check size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                      {recognizedText}
                    </div>
                  )}
                </div>

                <ButtonSend
                  onClick={sendAudioCommand}
                  disabled={
                    !recorder.audioBlob || isProcessing || !selectedRoute
                  }
                  isSending={isProcessing}
                  hasAudioToSubmit={!!recorder.audioBlob}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 min-h-[400px]">
              <RoutesTable
                routes={routes}
                selectedRouteId={selectedRoute?.id || null}
                onRouteSelect={setSelectedRoute}
              />
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (Только Логи) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Удален блок с SelectedRouteDisplay */}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col h-full max-h-[calc(100vh-100px)]">
              <div className="p-3 border-b bg-gray-50 font-medium text-gray-700">
                История команд
              </div>
              <div className="flex-1 overflow-y-auto">
                <LoggingTable logs={logs} />
              </div>
              <div className="p-3 border-t">
                <button
                  onClick={() => setLogs([])}
                  className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  Очистить историю
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
