import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteAndStopSearchBar } from "~/components/search/RouteAndStopSearchBar";
import { ItemContainer } from "~/routes/playground/ItemContainer";

export const Route = createFileRoute("/playground/searching")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Link to="/playground/containers/searchitems">Search Items</Link>
      {" -- "}
      <Link to="/playground/favorites">Favorites</Link>
      <RouteAndStopSearchBar />
      <ItemContainer />
    </div>
  );
}
