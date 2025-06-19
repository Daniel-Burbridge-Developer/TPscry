import { Stop } from "~/schemas/stopSchema";

interface StopResultItemProps {
  stop: Stop;
}

export const StopResultItem = ({ stop }: StopResultItemProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg p-2 dark:bg-gray-900">
      <span className="font-medium">{stop.name}</span>
      <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">
        {stop.id}
      </span>
    </div>
  );
};
