import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const routes = [
    { path: '/playground/searching', label: 'Search Playground' },
    // Add more routes here as they are created
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">TP SCRY</h1>
      <div className="space-y-2">
        {routes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className="block p-2 hover:bg-gray-100 rounded transition-colors"
          >
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
