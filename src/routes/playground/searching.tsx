import { createFileRoute } from '@tanstack/react-router';
import { FetchingSearchBar } from '~/components/FetchingSearchBar';

export const Route = createFileRoute('/playground/searching')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <FetchingSearchBar />
    </div>
  );
}
