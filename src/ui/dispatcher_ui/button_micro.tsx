// ButtonMicro.tsx
"use client";
import { Mic } from "lucide-react";
import { useState } from "react";

export default function ButtonMicro() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <button
      onClick={() => setIsRecording((prev) => !prev)}
      className={`flex items-center justify-center space-x-2 w-full border-2 rounded-xl px-6 py-3 font-medium transition-colors ${
        isRecording
          ? "border-red-500 bg-red-500 text-white"
          : "border-gray-300 hover:border-black hover:bg-gray-50 text-gray-700"
      }`}
    >
      <span className="text-base font-semibold">
        {isRecording ? "Остановить" : "Записать команду"}
      </span>
      <Mic size={24} className={isRecording ? "animate-pulse" : ""} />
    </button>
  );
}
