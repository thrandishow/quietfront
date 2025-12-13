// src/types/dispatcher.ts

export type LogEntry = {
  id: number;
  text: string; // <- Сюда будем класть ответ от сервера
  routeId: number; // <- ID маршрута
  timestamp: Date;
  isError?: boolean; // Опционально: помечать красным, если сервер вернул ошибку
};

export interface Route {
  id: number;
  team: string;
  status: "Ожидание" | "Принято" | "Отправлено";
}
