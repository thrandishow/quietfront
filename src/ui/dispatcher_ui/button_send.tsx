"use client";
import { Send, Check, AlertCircle, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ButtonSendProps = {
  onClick: () => void;
  disabled?: boolean;
  isSending?: boolean;
  hasAudioToSubmit?: boolean;
};

export default function ButtonSend({
  onClick,
  disabled = false,
  isSending = false,
  hasAudioToSubmit = false,
}: ButtonSendProps) {
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (disabled || isSending) return;

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
          : isSending
          ? "border-blue-500 bg-blue-50 text-blue-700 cursor-wait"
          : disabled && !hasAudioToSubmit
          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
          : "border-gray-300 hover:border-black hover:bg-gray-50 text-gray-700"
      }`}
    >
      {isSending ? (
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : isSent ? (
        <Check size={20} className="text-green-500" />
      ) : error ? (
        <AlertCircle size={20} className="text-red-500" />
      ) : !hasAudioToSubmit ? (
        <Info size={20} className="text-gray-400" />
      ) : (
        <Send size={20} className="transition-transform" />
      )}

      <span className="text-base font-semibold">
        {error
          ? "Ошибка!"
          : isSent
          ? "Отправлено!"
          : isSending
          ? "Отправка..."
          : !hasAudioToSubmit
          ? "Нет записи"
          : "Отправить команду"}
      </span>
    </button>
  );
}
