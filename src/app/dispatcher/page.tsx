"use client";

import RoutesTable, { Route } from "@/ui/dispatcher_ui/routes_table";
import Navbar from "@/ui/navbar";
import ButtonMicro from "@/ui/dispatcher_ui/button_micro";
import ButtonSend from "@/ui/dispatcher_ui/button_send";
import LoggingTable from "@/ui/dispatcher_ui/routes_logging";
import SelectedRouteDisplay from "@/ui/dispatcher_ui/selected_route";
import { useState, useEffect, useRef, useCallback } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";

// Конвертер аудио в WAV (встроенный)
const convertToWAV = async (audioBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        const arrayBuffer = reader.result as ArrayBuffer;

        // Декодируем аудио
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Создаем WAV файл
        const wavBlob = createWAVBlob(audioBuffer, audioContext.sampleRate);
        resolve(wavBlob);

        // Закрываем аудиоконтекст
        audioContext.close();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(audioBlob);
  });
};

// Создание WAV файла из AudioBuffer
const createWAVBlob = (audioBuffer: AudioBuffer, sampleRate: number): Blob => {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];

  let offset = 0;

  // Устанавливаем каналы
  for (let i = 0; i < numOfChan; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  // Записываем заголовок WAV
  writeString(view, offset, "RIFF");
  offset += 4;
  view.setUint32(offset, length - 8, true);
  offset += 4;
  writeString(view, offset, "WAVE");
  offset += 4;
  writeString(view, offset, "fmt ");
  offset += 4;
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, numOfChan, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * numOfChan * 2, true);
  offset += 4;
  view.setUint16(offset, numOfChan * 2, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeString(view, offset, "data");
  offset += 4;
  view.setUint32(offset, length - 44, true);
  offset += 4;

  // Записываем аудиоданные
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const val = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, val, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Типы данных
type LogEntry = {
  id: number;
  message: string;
  routeId: number;
  timestamp: Date;
  type: "success" | "error" | "info" | "processing";
};

// Вспомогательная функция для валидации статуса
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
    {
      id: 3,
      team: "Проезжайте станцию, не сажайте пассажиров",
      status: "Отправлено",
    },
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
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Состояния для аудиозаписи
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<
    "uploading" | "transcribing" | null
  >(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasAudioToSubmit, setHasAudioToSubmit] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSize, setAudioSize] = useState<number | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Refs для работы с медиа
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getRoutesData();
        setRoutes(data);
      } catch (error) {
        console.error("Failed to fetch routes:", error);
        addLog({
          message: "Ошибка загрузки маршрутов",
          routeId: -1,
          type: "error",
        });
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

  // Вспомогательная функция для добавления логов
  const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date(),
      ...log,
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  // 🔥 ФУНКЦИЯ ПОЛНОЙ ОЧИСТКИ ПРЕДЫДУЩИХ РЕСУРСОВ
  const cleanupPreviousRecording = () => {
    // Останавливаем текущую запись, если она идет
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = null;
    }

    // Останавливаем поток
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Очищаем таймер
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Очищаем буфер аудио
    audioChunksRef.current = [];

    // Очищаем URL объектов
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    // Сбрасываем состояния
    setHasAudioToSubmit(false);
    setAudioSize(null);
    setRecognizedText(null);
    setIsRecording(false);
    setProcessingProgress(0);

    // Отменяем текущую обработку, если она есть
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }

    // Очищаем таймеры прогресса
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // =============== АУДИОЗАПИСЬ ===============
  const startRecording = async () => {
    try {
      // 🔥 ПОЛНАЯ ОЧИСТКА ПРЕДЫДУЩИХ РЕСУРСОВ
      cleanupPreviousRecording();

      // Запрашиваем доступ к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Определяем поддерживаемый MIME-тип (для начальной записи)
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000, // Качество для последующей конвертации в WAV
      });

      // Очищаем буфер перед началом новой записи
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          // Создаем временный Blob для конвертации
          const tempBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });

          try {
            // Конвертируем в WAV
            const wavBlob = await convertToWAV(tempBlob);

            // Очищаем старый URL перед созданием нового
            if (audioUrl) {
              URL.revokeObjectURL(audioUrl);
            }

            // Создаем URL для прослушивания
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);
            setAudioSize(wavBlob.size);
            setHasAudioToSubmit(true);

            // Логируем информацию о конвертации
            addLog({
              message: `Аудио сконвертировано в WAV (${(
                wavBlob.size / 1024
              ).toFixed(1)} КБ)`,
              routeId: selectedRoute?.id || -1,
              type: "info",
            });
          } catch (error) {
            console.error("Ошибка конвертации в WAV:", error);
            addLog({
              message: "Ошибка конвертации аудио в WAV формат",
              routeId: selectedRoute?.id || -1,
              type: "error",
            });
          }
        }

        // Очищаем данные
        audioChunksRef.current = [];

        // Останавливаем аудиодорожки
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000); // Собираем данные каждую секунду
      mediaRecorderRef.current = mediaRecorder;

      // Запускаем таймер
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      setIsRecording(true);

      addLog({
        message: `Начата запись для маршрута "${selectedRoute?.team}"`,
        routeId: selectedRoute?.id || -1,
        type: "info",
      });
    } catch (error) {
      console.error("Ошибка доступа к микрофону:", error);
      addLog({
        message:
          "Ошибка доступа к микрофону. Разрешите доступ в настройках браузера.",
        routeId: -1,
        type: "error",
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();

      // Останавливаем все треки
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      addLog({
        message: `Запись завершена (${recordingTime} сек)`,
        routeId: selectedRoute?.id || -1,
        type: "info",
      });
    }
  };

  // 🔥 ИСПРАВЛЕННАЯ ФУНКЦИЯ ОЧИСТКИ ПОСЛЕ ОТПРАВКИ
  const cleanupAfterSend = (keepRecognizedText = false) => {
    // Очищаем URL после отправки
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    // Сбрасываем состояния
    setHasAudioToSubmit(false);
    setAudioSize(null);
    setIsProcessing(false);
    setProcessingStage(null);
    setProcessingProgress(0);
    setAbortController(null);

    // Очищаем таймеры прогресса
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // =============== ОТПРАВКА ===============
  const sendAudioCommand = async () => {
    if (!selectedRoute || isProcessing || !hasAudioToSubmit || !audioUrl)
      return;

    // Создаем AbortController для возможности отмены
    const controller = new AbortController();
    setAbortController(controller);

    setIsProcessing(true);
    setProcessingStage("uploading");
    setProcessingProgress(0);
    setRecognizedText(null); // Очищаем перед новой отправкой

    // Имитация прогресса загрузки (для UX)
    progressIntervalRef.current = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev < 30) return prev + 3;
        return prev;
      });
    }, 200);

    try {
      // Получаем Blob из URL
      const response = await fetch(audioUrl);
      const wavBlob = await response.blob();

      // Создаем FormData с правильным именем поля и расширением
      const formData = new FormData();
      const filename = `command-${Date.now()}.wav`; // Явно указываем .wav
      formData.append(
        "file",
        new File([wavBlob], filename, {
          type: "audio/wav",
        })
      );

      // Отправляем на правильный эндпоинт
      const startTime = Date.now();

      const transcribeResponse = await fetch(
        "http://localhost:8000/transcribe",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      // Останавливаем имитацию прогресса загрузки
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Начинаем имитацию прогресса распознавания
      setProcessingStage("transcribing");
      setProcessingProgress(30);

      progressIntervalRef.current = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 400);

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json().catch(() => ({}));
        const errorMessage =
          errorData.detail ||
          `HTTP error! status: ${transcribeResponse.status}`;
        throw new Error(errorMessage);
      }

      const result = await transcribeResponse.json();
      console.log("Распознанный текст:", result.text);

      // Устанавливаем распознанный текст
      setRecognizedText(result.text);

      // Автоматическое скрытие через 15 секунд
      setTimeout(() => {
        setRecognizedText((prev) => (prev === result.text ? null : prev));
      }, 15000);

      addLog({
        message: `Распознано: "${result.text}" (время: ${Math.round(
          (Date.now() - startTime) / 1000
        )} сек)`,
        routeId: selectedRoute.id,
        type: "success",
      });
    } catch (error) {
      console.error("Ошибка отправки аудиокоманды:", error);

      let errorMessage = "Не удалось распознать речь";
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Операция отменена пользователем";
          addLog({
            message: "Распознавание отменено",
            routeId: selectedRoute?.id || -1,
            type: "info",
          });
          return;
        }

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
        if (
          errorMessage.includes("415") ||
          errorMessage.includes("Unsupported media type")
        ) {
          errorMessage =
            "Неподдерживаемый формат аудио. Сервер ожидает WAV файл.";
        }
        if (errorMessage.includes("408") || errorMessage.includes("timeout")) {
          errorMessage =
            "Превышено время ожидания ответа от сервера. WAV файлы обрабатываются дольше.";
        }
      }

      addLog({
        message: errorMessage,
        routeId: selectedRoute?.id || -1,
        type: "error",
      });

      // Специальная обработка для таймаутов
      if (errorMessage.includes("timeout") || Date.now() - startTime > 60000) {
        addLog({
          message:
            "Совет: для WAV файлов делайте записи короче 10 секунд для более быстрой обработки",
          routeId: selectedRoute?.id || -1,
          type: "info",
        });
      }
    } finally {
      // 🔥 СОХРАНЯЕМ РАСПОЗНАННЫЙ ТЕКСТ ПРИ УСПЕШНОЙ ОТПРАВКЕ
      const shouldKeepText = recognizedText !== null;
      cleanupAfterSend(shouldKeepText);
    }
  };

  const cancelProcessing = () => {
    if (abortController) {
      abortController.abort();
      addLog({
        message: "Распознавание отменено пользователем",
        routeId: selectedRoute?.id || -1,
        type: "info",
      });
    }
  };

  // Очистка ресурсов при размонтировании
  useEffect(() => {
    return () => {
      cleanupPreviousRecording();
      cleanupAfterSend();
    };
  }, []);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

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

                {/* Важное предупреждение о WAV */}
                {!isRecording && selectedRoute && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-700">
                    ⚠️ WAV файлы обрабатываются дольше. Для быстрой работы
                    делайте записи короче 10 секунд.
                  </div>
                )}
              </div>

              {/* Кнопка отправки */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Распознать речь
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {hasAudioToSubmit
                      ? "Готово к распознаванию. Файл в формате WAV."
                      : "Запишите речь и остановите запись для распознавания"}
                  </p>

                  {/* Отображение информации о записи */}
                  {hasAudioToSubmit && audioUrl && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="font-medium">WAV файл готов</span>
                          {audioSize && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {(audioSize / 1024).toFixed(1)} КБ
                            </span>
                          )}
                        </div>
                        {audioSize &&
                          audioSize > 500000 && ( // Больше 500 КБ
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                              Обработка может занять время
                            </span>
                          )}
                      </div>

                      <audio
                        src={audioUrl}
                        controls
                        className="w-full h-8"
                        onEnded={() => URL.revokeObjectURL(audioUrl)}
                      />

                      <div className="mt-2 text-xs text-gray-500">
                        💡 WAV формат обеспечивает лучшее качество распознавания
                      </div>
                    </div>
                  )}

                  {/* Индикация прогресса для долгой обработки */}
                  {isProcessing && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>
                          {processingStage === "uploading"
                            ? "Загрузка WAV файла..."
                            : processingStage === "transcribing"
                            ? "Распознавание речи..."
                            : "Обработка..."}
                        </span>
                        <span>{processingProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${processingProgress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        WAV обработка может занять до 2 минут
                      </div>
                      <button
                        onClick={cancelProcessing}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center justify-center"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Отменить обработку
                      </button>
                    </div>
                  )}

                  {/* Отображение распознанного текста */}
                  {recognizedText && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                        <Check size={16} />
                        <span className="font-medium">Распознанный текст:</span>
                      </div>
                      <p className="text-sm bg-white p-2 rounded border border-blue-100 break-words">
                        {recognizedText}
                      </p>
                    </div>
                  )}
                </div>

                <ButtonSend
                  onClick={sendAudioCommand}
                  disabled={!hasAudioToSubmit || isProcessing || !selectedRoute}
                  isSending={isProcessing}
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

          {/* Правая колонка: Выбранный маршрут + Логи */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Выбранный маршрут */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <SelectedRouteDisplay selectedRoute={selectedRoute} />
            </div>

            {/* Логи */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                <h2 className="text-sm font-medium text-gray-800">
                  Журнал событий
                </h2>
              </div>

              <div
                className="flex-1 overflow-y-auto"
                style={{ maxHeight: "500px" }}
              >
                <LoggingTable logs={logs} />
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleClearLogs}
                  className="w-full text-base px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
                >
                  Очистить журнал
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
