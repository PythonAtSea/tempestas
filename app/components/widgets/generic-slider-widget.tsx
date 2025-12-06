"use client";

import { useEffect, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronRight } from "lucide-react";

interface GenericSliderWidgetProps {
  icon: string;
  title: string;
  children: ReactNode;
  dialogContent?: ReactNode;
}

function useIsFinePointer() {
  const getInitial = () =>
    typeof window !== "undefined"
      ? window.matchMedia("(pointer: fine)").matches
      : null;
  const [isFine, setIsFine] = useState<boolean | null>(getInitial);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");

    const handler = (e: MediaQueryListEvent) => setIsFine(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isFine;
}

export default function GenericSliderWidget({
  icon,
  title,
  children,
  dialogContent,
}: GenericSliderWidgetProps) {
  const isFinePointer = useIsFinePointer();

  const triggerCard = (
    <div
      className={`aspect-square border bg-muted/20 p-3 flex flex-col relative ${
        dialogContent
          ? "cursor-pointer hover:bg-muted/30 active:bg-muted/30"
          : ""
      }`}
    >
      <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
        <i className={`wi wi-fw ${icon}`} />
        {title}
        {dialogContent && (
          <ChevronRight className="size-4 ml-auto text-muted-foreground" />
        )}
      </p>
      {children}
    </div>
  );

  if (isFinePointer && dialogContent) {
    return (
      <Dialog>
        <DialogTrigger asChild>{triggerCard}</DialogTrigger>
        <DialogContent>
          <VisuallyHidden asChild>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          </VisuallyHidden>
          <div className="max-h-[70vh] overflow-y-auto">{dialogContent}</div>
        </DialogContent>
      </Dialog>
    );
  } else if (dialogContent) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{triggerCard}</DrawerTrigger>
        <DrawerContent className="select-none">
          <VisuallyHidden asChild>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
          </VisuallyHidden>
          <div className="overflow-y-auto px-6 pb-6">{dialogContent}</div>
        </DrawerContent>
      </Drawer>
    );
  } else {
    return triggerCard;
  }
}
