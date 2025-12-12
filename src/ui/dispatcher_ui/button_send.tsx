// @/ui/dispatcher_ui/button_send.tsx
"use client";
import { Send, Check, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ButtonSendProps = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
};

export default function ButtonSend({
  onClick,
  disabled = false,
  label = "Отправить команду",
}: ButtonSendProps) {
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (disabled) return;

    try {
      onClick();
      setIsSent(true);
      setError(false);
    } catch (err) {
      setError(true);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsSent(false);
      setError(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center justify-center space-x-2 w-full border-2 rounded-xl px-6 py-3 font-medium transition-all ${
        error
          ? "border-red-500 bg-red-50 text-red-700"
          : isSent
          ? "border-green-500 bg-green-50 text-green-700"
          : disabled
          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
          : "border-gray-300 hover:border-black hover:bg-gray-50 text-gray-700"
      }`}
    >
      <span className="text-base font-semibold">
        {error ? "Ошибка отправки!" : isSent ? "Отправлено!" : label}
      </span>

      {error ? (
        <AlertCircle size={20} className="text-red-500" />
      ) : isSent ? (
        <Check size={20} className="text-green-500" />
      ) : (
        <Send size={20} className="transition-transform" />
      )}
    </button>
  );
}
