import { createFileRoute, Link } from '@tanstack/react-router';
import { FetchingSearchBar } from '~/components/FetchingSearchBar';
import { ItemContainer } from '~/routes/playground/ItemContainer';

export const Route = createFileRoute('/playground/searching')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Link to="/playground/containers/searchitems">Search Items</Link>
      <FetchingSearchBar />
      <ItemContainer />
    </div>
  );
}
