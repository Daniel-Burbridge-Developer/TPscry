import { createFileRoute } from "@tanstack/react-router";
import { ItemContainer } from "../ItemContainer";

export const Route = createFileRoute("/playground/containers/searchitems")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <ItemContainer />
    </div>
  );
}
