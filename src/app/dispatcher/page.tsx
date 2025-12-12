"use client";

import RoutesTable, { Route } from "@/ui/dispatcher_ui/routes_table";
import Navbar from "@/ui/navbar";
import ButtonMicro from "@/ui/dispatcher_ui/button_micro";
import ButtonSend from "@/ui/dispatcher_ui/button_send";
import SelectedRouteDisplay from "@/ui/dispatcher_ui/selected_route";
import { useState, useEffect, useRef, useCallback } from "react";

// Валидация статуса маршрута
function validateStatus(status: string): "Ожидание" | "Принято" | "Отправлено" {
  switch (status) {
    case "Принято":
      return "Принято";
    case "Отправлено":
      return "Отправлено";
    default:
      return "Ожидание";
  }
}

async function getRoutesData(): Promise<Route[]> {
  const rawData = [
    { id: 1, team: "Маршрут 101", status: "Ожидание" },
    { id: 2, team: "Оставайтесь на станции", status: "Принято" },
    { id: 3, team: "Проезжайте станцию", status: "Отправлено" },
    { id: 4, team: "Остановитесь в туннеле", status: "Принято" },
    { id: 5, team: "Едьте на ремонт", status: "Принято" },
  ];

  return rawData.map((route) => ({
    ...route,
    status: validateStatus(route.status),
  }));
}

export default function DispatcherPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  // Состояния для аудиозаписи
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasAudioToSubmit, setHasAudioToSubmit] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // =============== АУДИОЗАПИСЬ ===============
  const startRecording = async () => {
    try {
      if (isRecording) return;

      // Сбрасываем состояние
      setHasAudioToSubmit(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Таймер записи
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Ошибка доступа к микрофону:", error);
      alert(
        "Не удалось получить доступ к микрофону. Разрешите доступ в настройках браузера."
      );
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();

    // Останавливаем треки
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Устанавливаем флаг готовности к отправке
    setHasAudioToSubmit(true);
  };

  // =============== ОТПРАВКА ===============
  const sendAudioCommand = async () => {
    if (!selectedRoute || isSending || !hasAudioToSubmit) return;

    setIsSending(true);

    try {
      // Создаем Blob из записанных данных
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      audioChunksRef.current = []; // Очищаем буфер

      // Создаем FormData с правильным именем поля
      const formData = new FormData();
      formData.append("file", audioBlob, `command-${Date.now()}.webm`);

      // Правильный URL с портом 8000
      const TRANSCRIBE_API_URL = "http://localhost:8000/transcribe";

      console.log("Отправка аудио на:", TRANSCRIBE_API_URL);

      const response = await fetch(TRANSCRIBE_API_URL, {
        method: "POST",
        body: formData,
        // НЕ УКАЗЫВАЕМ Content-Type - браузер сделает это автоматически с boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Безопасное чтение ошибки
        const errorMessage =
          errorData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Распознанный текст:", result.text);

      // Сбрасываем состояние готовности к отправке
      setHasAudioToSubmit(false);

      // Добавляем сообщение в интерфейс (опционально)
      alert(`Команда отправлена: "${result.text}"`);
    } catch (error) {
      console.error("Ошибка отправки аудиокоманды:", error);

      // Показываем детальную ошибку пользователю
      let errorMessage = "Не удалось отправить команду";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Специальные сообщения для распространенных ошибок
        if (errorMessage.includes("Failed to fetch")) {
          errorMessage =
            "Не удалось подключиться к серверу распознавания. Проверьте, что бэкенд запущен на порту 8000";
        }
        if (errorMessage.includes("413")) {
          errorMessage =
            "Аудиофайл слишком большой. Максимальный размер: 25 МБ";
        }
        if (errorMessage.includes("415")) {
          errorMessage =
            "Неподдерживаемый формат аудио. Используйте mp3, wav, m4a, ogg или flac";
        }
      }

      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Левая колонка: Кнопки + Список маршрутов */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Верхняя часть: Кнопки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Кнопка записи аудио */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Текущий маршрут:
                  </h3>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {selectedRoute?.team || "Не выбран"}
                  </p>
                </div>

                <ButtonMicro
                  isRecording={isRecording}
                  onStart={startRecording}
                  onStop={stopRecording}
                />

                {isRecording && (
                  <div className="mt-3 text-center text-sm text-red-500 font-medium">
                    Запись: {Math.floor(recordingTime / 60)}:
                    {(recordingTime % 60).toString().padStart(2, "0")}
                  </div>
                )}
              </div>

              {/* Кнопка отправки */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Отправить команду
                  </h3>
                  <p className="text-xs text-gray-500">
                    {hasAudioToSubmit
                      ? "Готово к отправке. Нажмите для отправки аудиокоманды"
                      : "Запишите команду и остановите запись для отправки"}
                  </p>
                </div>

                <ButtonSend
                  onClick={sendAudioCommand}
                  disabled={!hasAudioToSubmit || isSending || !selectedRoute}
                  isSending={isSending}
                  hasAudioToSubmit={hasAudioToSubmit}
                />
              </div>
            </div>

            {/* Список маршрутов */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">
                  Список маршрутов
                </h2>
              </div>

              <div className="overflow-y-auto flex-1">
                <RoutesTable
                  routes={routes}
                  selectedRouteId={selectedRoute?.id || null}
                  onRouteSelect={setSelectedRoute}
                />
              </div>
            </div>
          </div>

          {/* Правая колонка: Только выбранный маршрут */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <SelectedRouteDisplay selectedRoute={selectedRoute} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
