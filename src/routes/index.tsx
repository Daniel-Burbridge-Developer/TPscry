import { createFileRoute } from '@tanstack/react-router';
import { Clock, Heart, Search } from 'lucide-react';
import { FetchingSearchBar } from '~/components/FetchingSearchBar';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Heading />
      <SearchBar />
      <SearchResults />
      <RecentSearches />
      <Favouites />
    </div>
  );
}

const Heading = () => {
  return (
    <div>
      <h1>TP SCRY</h1>
      <p>Tracking Transperth in real-time</p>
    </div>
  );
};

const SearchBar = () => {
  return <FetchingSearchBar />;
};

const SearchResults = () => {
  return (
    <div>
      <div>
        <h1 className="flex items-center gap-2">
          <Search className="w-6 h-6" />
          Search Results
        </h1>
      </div>
    </div>
  );
};

const RecentSearches = () => {
  return (
    <div>
      <h1 className="flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Recent Searches
      </h1>
    </div>
  );
};

const Favouites = () => {
  return (
    <div>
      <h1 className="flex items-center gap-2">
        <Heart className="w-6 h-6" />
        Favourites
      </h1>
    </div>
  );
};
