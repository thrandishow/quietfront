"use client";
import { Send, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function ButtonSend() {
  const [isSent, setIsSent] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    // Сбрасываем предыдущий таймер, если он есть
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsSent(true);

    // Автоматически возвращаем в исходное состояние через 2 секунды
    timerRef.current = setTimeout(() => {
      setIsSent(false);
      timerRef.current = null;
    }, 1000);
  };

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <button
        onClick={handleClick}
        disabled={isSent} // Опционально: блокируем повторные клики во время отправки
        className={`flex items-center space-x-3 border-2 rounded-xl px-5 py-2.5 transition-all duration-300 ${
          isSent
            ? "border-green-500 bg-green-50 text-green-700 animate-pulse"
            : "border-black hover:bg-gray-50 hover:text-blue-600 text-gray-700"
        }`}
      >
        <span className="font-medium">
          {isSent ? "Отправлено!" : "Отправить"}
        </span>
        {isSent ? (
          <Check size={20} className="text-green-500" />
        ) : (
          <Send
            size={20}
            className="group-hover:translate-x-1 transition-transform duration-200"
          />
        )}
      </button>
    </div>
  );
}
