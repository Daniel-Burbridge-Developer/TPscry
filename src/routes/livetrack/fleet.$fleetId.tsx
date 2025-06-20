import { createFileRoute } from "@tanstack/react-router";
import { useTripLiveDetails } from "~/hooks/useTripLiveDetails";

export const Route = createFileRoute("/livetrack/fleet/$fleetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { fleetId } = Route.useParams();
  const {
    data: trip,
    isLoading,
    error,
    currentStop,
    nextStop,
    delayMinutes,
    stopsWithDelay,
  } = useTripLiveDetails(fleetId);

  if (!fleetId) {
    return <div>No fleet ID provided</div>;
  }

  if (!currentStop) {
    return <div>No trip found</div>;
  }

  return <div>Hello {currentStop.stopName}!</div>;
}
