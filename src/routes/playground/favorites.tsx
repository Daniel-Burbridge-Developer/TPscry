import { createFileRoute } from "@tanstack/react-router";
import { FavContainer } from "./favContainer";
export const Route = createFileRoute("/playground/favorites")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <FavContainer />
    </div>
  );
}
