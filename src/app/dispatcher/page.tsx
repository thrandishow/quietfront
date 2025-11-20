import RoutesTable, { Route } from "@/ui/dispatcher_ui/routes_table";
import Navbar from "@/ui/navbar";

async function getRoutesData() {
  "use server";
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
    <>
      <Navbar></Navbar>
      <div>
        <RoutesTable routes={routes as Route[]} />
      </div>
    </>
  );
}
