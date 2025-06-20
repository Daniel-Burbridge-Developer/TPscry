import { Star } from "lucide-react";
import type { MouseEvent } from "react";
import { useRouteStore } from "~/stores/routeStore";
import { cn } from "~/lib/utils"; // If you don't have a cn utility, remove this and use className directly

interface FavouriteToggleProps {
  routeId: string;
  size?: number;
  className?: string;
}

const FavouriteToggle = ({
  routeId,
  size = 18,
  className,
}: FavouriteToggleProps) => {
  const favouriteRouteIds = useRouteStore((s) => s.favouriteRouteIds);
  const addFavouriteRouteId = useRouteStore((s) => s.addFavouriteRouteId);
  const removeFavouriteRouteId = useRouteStore((s) => s.removeFavouriteRouteId);

  const isFavourited = favouriteRouteIds.includes(routeId);

  const toggleFavourite = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isFavourited) {
      removeFavouriteRouteId(routeId);
    } else {
      addFavouriteRouteId(routeId);
    }
  };

  return (
    <button
      type="button"
      aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
      onClick={toggleFavourite}
      className={cn("transition-colors", className)}
      tabIndex={0}
    >
      <Star
        size={size}
        className={`transition-colors ${isFavourited ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
        fill={isFavourited ? "#facc15" : "none"}
        strokeWidth={1.5}
      />
    </button>
  );
};

export default FavouriteToggle;
