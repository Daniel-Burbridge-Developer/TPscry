//Without too much effort, I think I could set up a flag system so this could be a universal search bar
// for all types. Pass in "options" that selects exactly what it should update at any given time.

import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useSearchStore } from "~/stores/searchStore";

export function RouteAndStopSearchBar() {
  const searchTerm = useSearchStore((state) => state.searchTerms.routes);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  return (
    <div className="w-full shadow-lg">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
          <Search className="h-5 w-5" />
        </span>
        <Input
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            // Update both route and stop search terms to keep them in sync
            setSearchTerm("routes", value);
            setSearchTerm("stops", value);
          }}
          placeholder="Search for routes or stops..."
          className="pl-10"
        />
      </div>
    </div>
  );
}
