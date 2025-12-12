// @/ui/dispatcher_ui/button_micro.tsx
"use client";
import { Mic } from "lucide-react";

type ButtonMicroProps = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
};

export default function ButtonMicro({
  isRecording,
  onStart,
  onStop,
}: ButtonMicroProps) {
  return (
    <button
      onClick={isRecording ? onStop : onStart}
      className={`flex flex-col items-center justify-center w-full border-2 rounded-xl px-6 py-4 font-medium transition-all ${
        isRecording
          ? "border-red-500 bg-red-50 text-red-700"
          : "border-gray-300 hover:border-black hover:bg-gray-50 text-gray-700"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
          isRecording ? "bg-red-500 animate-pulse" : "bg-gray-200"
        }`}
      >
        {isRecording ? (
          <div className="w-3 h-3 bg-white rounded-full" />
        ) : (
          <Mic size={24} />
        )}
      </div>

      <span className="text-base font-semibold text-center">
        {isRecording ? "Идет запись..." : "Записать аудио"}
      </span>

      {isRecording && (
        <span className="text-xs text-red-500 mt-1 animate-pulse">
          Говорите в микрофон
        </span>
      )}
    </button>
  );
}
