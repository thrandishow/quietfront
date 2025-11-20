// ButtonSend.tsx
"use client";
import { Send, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function ButtonSend() {
  const [isSent, setIsSent] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setIsSent(true);
    timerRef.current = setTimeout(() => {
      setIsSent(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center space-x-2 w-full border-2 rounded-xl px-6 py-3 font-medium transition-all ${
        isSent
          ? "border-green-500 bg-green-50 text-green-700"
          : "border-gray-300 hover:border-black hover:bg-gray-50 text-gray-700"
      }`}
    >
      <span className="text-base font-semibold">
        {isSent ? "Отправлено!" : "Отправить"}
      </span>
      {isSent ? (
        <Check size={24} className="text-green-500" />
      ) : (
        <Send size={24} className="transition-transform" />
      )}
    </button>
  );
}
