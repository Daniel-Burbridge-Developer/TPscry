import { Trip } from '~/schemas/index';

interface TripCardProps {
  trip: Trip;
}

const TripCard = ({ trip }: TripCardProps) => {
  return (
    <li className="p-2 rounded border border-muted bg-muted/50 flex flex-col">
      <span className="font-medium text-primary">
        {trip.tripHeadsign ? `to ${trip.tripHeadsign}` : 'No headsign'}
      </span>
      <span className="text-xs text-muted-foreground">Trip ID: {trip.id}</span>
      {trip.shapeId && (
        <span className="text-xs text-muted-foreground">
          Shape ID: {trip.shapeId}
        </span>
      )}
      {trip.stops && trip.stops.length > 0 && (
        <span className="text-xs text-muted-foreground">
          Stops: {trip.stops.length}
        </span>
      )}
    </li>
  );
};

export default TripCard;
