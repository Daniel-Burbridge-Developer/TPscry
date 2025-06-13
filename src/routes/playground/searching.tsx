import { createFileRoute } from '@tanstack/react-router';
import { FetchingSearchBar } from '~/components/FetchingSearchBar';
import { ItemContainer } from '~/routes/playground/ItemContainer';

export const Route = createFileRoute('/playground/searching')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <FetchingSearchBar />
      <ItemContainer />
    </div>
  );
}
