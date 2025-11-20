import RoutesTable from "@/ui/dispatcher_ui/routes_table";

async function getRoutesData() {
  // Здесь можно делать запрос к API или базе данных
  return [
    { id: 1, team: "Отправляйтесь", status: "Ожидание" },
    { id: 2, team: "Оставайтесь на станции", status: "Принято" },
    {
      id: 3,
      team: "Выпускайте пассажиров и едьте на ремонт",
      status: "Ожидание",
    },
    { id: 4, team: "Всё ок", status: "Принято" },
  ];
}
export default async function DispatcherPage() {
  const routes = await getRoutesData();

  return (
    <div>
      <RoutesTable routes={routes} />
    </div>
  );
}
