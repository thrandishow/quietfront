"use client";
import { Mic } from "lucide-react";
import { useState } from "react";

export default function ButtonMicro() {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <button
        onClick={toggleRecording}
        className={`flex items-center space-x-3 border-4 rounded-xl px-5 py-3 font-medium transition-colors duration-200 ${
          isRecording
            ? "border-red-500 bg-red-500 text-white"
            : "border-black bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        }`}
      >
        <span>{isRecording ? "Остановить запись" : "Записать команду"}</span>
        <Mic
          size={24}
          className={isRecording ? "animate-pulse text-white" : ""}
        />
      </button>
    </div>
  );
}
