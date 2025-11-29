"use client";

import { Loader2 } from "lucide-react";

interface ConditionsSummaryProps {
  conditionsSummary: string;
}

export default function ConditionsSummary({
  conditionsSummary,
}: ConditionsSummaryProps) {
  if (conditionsSummary === "DND") return null;

  return (
    <div className="p-6 w-full pb-0">
      <p className="text-sm border border-b-0 p-4 bg-muted/20">
        {conditionsSummary ? (
          <span>{conditionsSummary}</span>
        ) : (
          <>
            <Loader2 className="inline-block size-4 animate-spin mr-2" />
            <span className="text-muted-foreground">Fetching summary...</span>
          </>
        )}
      </p>
    </div>
  );
}
