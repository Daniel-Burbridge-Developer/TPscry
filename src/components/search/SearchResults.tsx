import { useSearchStore } from "~/stores/searchStore";
import { useSearchRoutesQuery } from "~/hooks/useSearchRoutesQuery";
import { useSearchStopsQuery } from "~/hooks/useSearchStopsQuery";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { CardHeader, CardTitle, Card, CardContent } from "../ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Route } from "lucide-react";
import { useState } from "react";
import BusResultsCard from "./RouteResultsCard";
import StopResultsCard from "./StopResultsCard";

const SearchResults = () => {
  const [stopsExpanded, setStopsExpanded] = useState(true);

  const debouncedSearchTerm = useSearchStore(
    (state) => state.debouncedSearchTerms.routes,
  );

  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    isError: isErrorRoutes,
  } = useSearchRoutesQuery(debouncedSearchTerm, {
    enabled: debouncedSearchTerm.length > 0,
  });

  const {
    data: stops = [],
    isLoading: isLoadingStops,
    isError: isErrorStops,
  } = useSearchStopsQuery(debouncedSearchTerm, {
    enabled: debouncedSearchTerm.length > 0,
  });

  if (isLoadingRoutes || isLoadingStops) {
    return <div>Loading...</div>;
  }

  if (isErrorRoutes || isErrorStops) {
    return <div>Error</div>;
  }

  // why is stops not an array????
  if (routes.length === 0 && stops.length === 0) {
    return <div>No results found</div>;
  }

  return (
    <div>
      <h1>Search Results</h1>
      <BusResultsCard routes={routes} />
      <StopResultsCard stops={stops} />
    </div>
  );
};

export default SearchResults;
