import { Route } from '~/schemas/routeSchema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useRouteTripsQuery } from '~/hooks/useRouteTripsQuery';
import TripCard from './TripCard';

interface BusCardProps {
  route: Route;
}

const BusCard = ({ route }: BusCardProps) => {
  const { data: trips } = useRouteTripsQuery(route.id, {
    enabled: Boolean(route.id),
  });

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{route.shortName || route.longName}</span>
          <span className="text-xs text-muted-foreground ml-2">{route.id}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trips && trips.length > 0 ? (
          <ul className="space-y-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground">
            No trips found for this route.
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default BusCard;
