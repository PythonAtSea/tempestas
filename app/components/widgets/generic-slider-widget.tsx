"use client";

import { ReactNode } from "react";

interface GenericSliderWidgetProps {
  icon: string;
  title: string;
  children: ReactNode;
}

export default function GenericSliderWidget({
  icon,
  title,
  children,
}: GenericSliderWidgetProps) {
  return (
    <div className="aspect-square border bg-muted/20 p-3 flex flex-col relative">
      <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
        <i className={`wi wi-fw ${icon}`} />
        {title}
      </p>
      {children}
    </div>
  );
}
