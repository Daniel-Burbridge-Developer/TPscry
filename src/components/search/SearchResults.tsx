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

const SearchResults = () => {
  const [busRoutesExpanded, setBusRoutesExpanded] = useState(true);

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
      <div className="mb-4 space-y-4 sm:mb-6 sm:space-y-6">
        {routes.length > 0 && (
          <Collapsible
            open={busRoutesExpanded}
            onOpenChange={() => setBusRoutesExpanded(!busRoutesExpanded)}
          >
            <Card className="w-full border-none bg-transparent shadow-none">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer pb-3 transition-colors hover:bg-gray-500 dark:hover:bg-gray-800 sm:pb-6">
                  <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 sm:h-5 sm:w-5" />
                      Bus Routes ({routes.length})
                    </div>
                    {busRoutesExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0 sm:space-y-4">
                  {routes.map((route) => (
                    <div key={route.id}>
                      {route.longName || route.shortName}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
