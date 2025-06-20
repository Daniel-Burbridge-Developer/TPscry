import { useState } from "react";
import { Stop } from "~/schemas/stopSchema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useExternalStopData } from "~/hooks/useExternalStopData";
import { Badge } from "~/components/ui/badge";
import { ChevronUp, ChevronDown, Heart } from "lucide-react";
import { useStopStore } from "~/stores/stopStore";
import StopArrivalCard from "./StopArrivalCard";

interface StopResultItemProps {
  stop: Stop;
}

export const StopResultItem = ({ stop }: StopResultItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const stopIdStr = String(stop.id);
  const { favouriteStopIds, addFavouriteStopId, removeFavouriteStopId } =
    useStopStore();

  // Fetch upcoming arrivals for this stop (poll every 15 s)
  const { data: arrivals } = useExternalStopData(stopIdStr, {
    enabled: isExpanded,
    refetchInterval: 15_000,
  });

  const totalLiveArrivals = arrivals?.filter((a) => a.liveStatus).length ?? 0;

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => setIsExpanded(!isExpanded)}
    >
      <div className="rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <Heart
                className={`h-4 w-4 cursor-pointer ${
                  favouriteStopIds.includes(stopIdStr)
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500"
                }`}
                fill={
                  favouriteStopIds.includes(stopIdStr) ? "currentColor" : "none"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (favouriteStopIds.includes(stopIdStr)) {
                    removeFavouriteStopId(stopIdStr);
                  } else {
                    addFavouriteStopId(stopIdStr);
                  }
                }}
              />
              <h3 className="text-base font-semibold sm:text-lg">
                Stop {stop.name}
              </h3>
              <Badge variant="outline" className="text-xs">
                {stop.id}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {totalLiveArrivals > 0 && (
                <div className="hidden text-right sm:block">
                  <div className="text-sm text-gray-500">
                    {totalLiveArrivals} live
                  </div>
                </div>
              )}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount>
          <div
            className={`flex-col justify-between rounded-lg p-2 dark:bg-gray-900 ${
              isExpanded ? "" : "hidden"
            }`}
          >
            {arrivals && arrivals.length > 0 ? (
              arrivals.map((a) => (
                <StopArrivalCard key={a.tripId} arrival={a} />
              ))
            ) : (
              <div className="text-center text-sm text-gray-500">
                No upcoming arrivals.
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
