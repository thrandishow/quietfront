// src/lib/api-mock.ts
import { Route } from "@/app/types/dispatcher";

function validateStatus(status: string): Route["status"] {
  switch (status) {
    case "Принято":
      return "Принято";
    case "Отправлено":
      return "Отправлено";
    default:
      return "Ожидание";
  }
}

export async function getRoutesData(): Promise<Route[]> {
  // Имитация задержки сети
  // await new Promise(resolve => setTimeout(resolve, 500));

  const rawData = [
    { id: 1, team: "Ожидание команды", status: "Ожидание" },
    { id: 2, team: "Оставайтесь на станции", status: "Принято" },
    { id: 3, team: "Проезжайте станцию", status: "Отправлено" },
    { id: 4, team: "Остановитесь в туннеле", status: "Принято" },
    { id: 5, team: "Едьте на ремонт", status: "Принято" },
  ];

  return rawData.map((route) => ({
    ...route,
    status: validateStatus(route.status),
  })) as Route[];
}
