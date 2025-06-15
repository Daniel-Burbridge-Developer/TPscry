import { Input } from "./ui/input";
import { useSearchRoutesQuery } from "~/hooks/useSearchRoutesQuery";
import { useSearchStopsQuery } from "~/hooks/useSearchStopsQuery";
import { useSearchStore } from "~/stores/searchStore";

export function FetchingSearchBar() {
  const searchTerm = useSearchStore((state) => state.searchTerms.routes);
  const debouncedRouteTerm = useSearchStore(
    (state) => state.debouncedSearchTerms.routes,
  );
  const debouncedStopTerm = useSearchStore(
    (state) => state.debouncedSearchTerms.stops,
  );
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);
  const recentSearches = useSearchStore(
    (state) => state.recentSearchTerms.routes,
  );

  // Fire route query
  useSearchRoutesQuery(debouncedRouteTerm, {
    enabled: Boolean(debouncedRouteTerm),
  });

  // Fire stop query simultaneously
  useSearchStopsQuery(debouncedStopTerm, {
    enabled: Boolean(debouncedStopTerm),
  });

  return (
    <div className="w-full max-w-md">
      <Input
        value={searchTerm}
        onChange={(e) => {
          const value = e.target.value;
          // Update both route and stop search terms to keep them in sync
          setSearchTerm("routes", value);
          setSearchTerm("stops", value);
        }}
        placeholder="Search..."
      />

      {recentSearches.length > 0 && (
        <div className="m-2">
          <p className="mb-1 text-xs text-muted-foreground">Recent searches</p>
          <div className="flex w-fit flex-row-reverse flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                className="rounded bg-gray-100 px-2 py-1 text-sm transition-colors hover:bg-gray-200"
                onClick={() => {
                  setSearchTerm("routes", term);
                  setSearchTerm("stops", term);
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
