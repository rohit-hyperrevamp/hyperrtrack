"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { confirmAction } from "@/components/ConfirmProvider";

type SheetDirty = { mark: () => void; reset: () => void };
const SheetDirtyContext = React.createContext<SheetDirty | null>(null);

/** Sheet that asks before closing when something was typed and not saved. */
const Sheet = ({ onOpenChange, children, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) => {
  const dirty = React.useRef(false);
  const ctx = React.useMemo<SheetDirty>(() => ({ mark: () => { dirty.current = true; }, reset: () => { dirty.current = false; } }), []);
  const handle = React.useCallback((next: boolean) => {
    if (next || !dirty.current) { dirty.current = false; onOpenChange?.(next); return; }
    void confirmAction({ title: "Close without saving?", description: "What you've entered here will be lost.", confirmText: "Discard", cancelText: "Keep editing", destructive: true })
      .then((ok) => { if (ok) { dirty.current = false; onOpenChange?.(false); } });
  }, [onOpenChange]);
  return <SheetDirtyContext.Provider value={ctx}><SheetPrimitive.Root onOpenChange={handle} {...props}>{children}</SheetPrimitive.Root></SheetDirtyContext.Provider>;
};

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-[110] gap-3 overflow-y-auto bg-card/95 backdrop-blur-xl text-card-foreground border-border/60 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out sm:gap-4 sm:p-6",
  {
    variants: {
      side: {
        center: "left-1/2 top-1/2 w-[calc(100vw-1.5rem)] max-w-xl max-h-[calc(100dvh-1.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-5 pt-6 shadow-2xl data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out sm:p-7",
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:w-3/4 sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:w-3/4 sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "center",
    },
  },
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "center", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content data-slot="sheet-content" ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
       <SheetPrimitive.Close className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-brand hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="sheet-header" className={cn("flex flex-col space-y-1 pr-12 pb-2 text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="sheet-footer"
    className={cn("flex flex-row justify-end gap-2 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-base font-semibold text-foreground sm:text-lg", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("hidden text-sm text-muted-foreground sm:block", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
