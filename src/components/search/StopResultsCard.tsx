import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { Stop } from "~/schemas/stopSchema";
import { StopResultItem } from "./StopResultItem";

type StopResultsCardProps = {
  stops: Stop[];
};

const StopResultsCard = ({ stops }: StopResultsCardProps) => {
  const [stopsExpanded, setStopsExpanded] = useState(true);

  if (!stops || stops.length === 0) return null;

  return (
    <div className="mb-4 space-y-4 sm:mb-6 sm:space-y-6">
      <Collapsible
        open={stopsExpanded}
        onOpenChange={() => setStopsExpanded(!stopsExpanded)}
      >
        <Card className="w-full border-none bg-transparent shadow-none">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer pb-3 transition-colors hover:bg-gray-500 dark:hover:bg-gray-800 sm:pb-6">
              <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  Stops ({stops.length})
                </div>
                {stopsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0 sm:space-y-4">
              {stops.map((stop) => (
                <StopResultItem key={stop.id} stop={stop} />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default StopResultsCard;
