"use client";

interface LastRefreshProps {
  lastRefresh: Date;
  autoRefreshInterval: number;
  onRefresh: () => void;
}

export default function LastRefresh({
  lastRefresh,
  autoRefreshInterval,
  onRefresh,
}: LastRefreshProps) {
  return (
    <div className="w-full px-6 pb-4">
      <p className="text-xs text-muted-foreground italic">
        Last refreshed at{" "}
        {lastRefresh.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })}{" "}
        (
        <button
          className="text-blue-500 hover:underline"
          onClick={onRefresh}
        >
          refresh
        </button>
        ing every {autoRefreshInterval / 1000} seconds)
      </p>
    </div>
  );
}
