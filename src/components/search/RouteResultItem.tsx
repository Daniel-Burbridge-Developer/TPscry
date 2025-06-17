import { Route as RouteType } from "~/schemas/routeSchema";

interface RouteResultItemProps {
  route: RouteType;
}

export const RouteResultItem = ({ route }: RouteResultItemProps) => {
  const routeName = route.longName || route.shortName || "Unnamed Route";

  return (
    <div className="flex items-center justify-between rounded-lg p-2 dark:bg-gray-900">
      <span className="font-medium">{routeName}</span>
      <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">
        {route.id}
      </span>
    </div>
  );
};
