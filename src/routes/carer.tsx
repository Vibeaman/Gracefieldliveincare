import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/carer")({
  component: CarerLayout,
});

function CarerLayout() {
  return <Outlet />;
}
