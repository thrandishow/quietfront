// src/hooks/useAudioRecorder.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { convertToWAV } from "@/app/utils/audio_utils";

export type RecorderState = {
  isRecording: boolean;
  recordingTime: number;
  audioUrl: string | null;
  audioBlob: Blob | null; // Удобно сразу отдавать Blob для отправки
  error: string | null;
};

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs для хранения инстансов между рендерами
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Очистка всех ресурсов (таймеры, потоки)
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Если был старый URL - чистим память
    // (опционально можно не чистить, если мы хотим сохранить предыдущую запись до новой)
  }, []);

  // Старт записи
  const startRecording = useCallback(async () => {
    try {
      cleanup(); // Сброс перед новой записью
      setError(null);
      setAudioUrl(null);
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: mimeType });

        try {
          if (rawBlob.size < 100) return; // Слишком короткая запись

          const wavBlob = await convertToWAV(rawBlob); // Используем утилиту
          const url = URL.createObjectURL(wavBlob);

          setAudioBlob(wavBlob);
          setAudioUrl(url);
        } catch (e) {
          console.error(e);
          setError("Ошибка конвертации аудио");
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(
        () => setRecordingTime((p) => p + 1),
        1000
      );
    } catch (err) {
      console.error(err);
      setError("Нет доступа к микрофону");
      setIsRecording(false);
    }
  }, [cleanup]);

  // Стоп записи
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      // Останавливаем стрим сразу
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  // Сброс аудио (после успешной отправки)
  const resetAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setError(null);
  }, [audioUrl]);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      cleanup();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [cleanup, audioUrl]);

  return {
    isRecording,
    recordingTime,
    audioUrl,
    audioBlob,
    audioSize: audioBlob?.size || 0,
    error,
    startRecording,
    stopRecording,
    resetAudio,
  };
}
