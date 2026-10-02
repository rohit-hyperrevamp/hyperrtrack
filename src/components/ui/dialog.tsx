"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { confirmAction } from "@/components/ConfirmProvider";

const DialogPortalContainerContext = React.createContext<HTMLElement | null>(null);

export function useDialogPortalContainer() {
  return React.useContext(DialogPortalContainerContext);
}

// ---- Dirty-guard plumbing -----------------------------------------------
type DirtyCtx = {
  dirtyRef: React.MutableRefObject<boolean>;
  reset: () => void;
  disabled: boolean;
  markDirty: () => void;
  markPristine: () => void;
};
const DialogDirtyContext = React.createContext<DirtyCtx | null>(null);

export const DialogDirtyGuardOff = ({ children }: { children: React.ReactNode }) => {
  const dirtyRef = React.useRef(false);
  return (
    <DialogDirtyContext.Provider
      value={{
        dirtyRef,
        reset: () => {},
        disabled: true,
        markDirty: () => {},
        markPristine: () => {},
      }}
    >
      {children}
    </DialogDirtyContext.Provider>
  );
};

type DialogRootProps = React.ComponentProps<typeof DialogPrimitive.Root>;

const Dialog = ({ onOpenChange, open, defaultOpen, children, ...props }: DialogRootProps) => {
  const dirtyRef = React.useRef(false);
  const ctxRef = React.useRef<DirtyCtx>({
    dirtyRef,
    reset: () => {
      dirtyRef.current = false;
    },
    disabled: false,
    markDirty: () => {
      dirtyRef.current = true;
    },
    markPristine: () => {
      dirtyRef.current = false;
    },
  });

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        dirtyRef.current = false;
        onOpenChange?.(true);
        return;
      }
      if (!dirtyRef.current || ctxRef.current.disabled) {
        onOpenChange?.(false);
        return;
      }
      void confirmAction({
        title: "Discard unsaved changes?",
        description: "Any information you've entered will be lost.",
        confirmText: "Discard",
        cancelText: "Keep editing",
        destructive: true,
      }).then((ok) => {
        if (ok) {
          dirtyRef.current = false;
          onOpenChange?.(false);
        }
      });
    },
    [onOpenChange],
  );

  return (
    <DialogDirtyContext.Provider value={ctxRef.current}>
      <DialogPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </DialogDirtyContext.Provider>
  );
};

const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
      className={cn(
        "fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  overlayClassName?: string;
  responsive?: boolean;
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, overlayClassName, responsive, children, ...props }, ref) => {
  const [contentElement, setContentElement] = React.useState<HTMLElement | null>(null);
  const [pristine, setPristine] = React.useState(true);
  const dirtyCtx = React.useContext(DialogDirtyContext);

  const handleRef = React.useCallback(
    (node: React.ElementRef<typeof DialogPrimitive.Content> | null) => {
      setContentElement(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  React.useEffect(() => {
    if (!contentElement || !dirtyCtx || dirtyCtx.disabled) return;
    dirtyCtx.reset();
    setPristine(true);
    requestAnimationFrame(() => contentElement.scrollTo?.({ top: 0, left: 0 }));
    const SAVE_RX = /^(save|update|create|submit|confirm|apply|generate|send|sign|next|continue|finish|done)\b/i;
    const ACTION_RX = /^(approve|reject|decline|acknowledge|enable|open)\b/i;

    const markDirty = (e: Event) => {
      if (!(e as UIEvent).isTrusted) return;
      if (!dirtyCtx.dirtyRef.current) {
        dirtyCtx.dirtyRef.current = true;
        setPristine(false);
      }
    };
    const markPristine = () => {
      dirtyCtx.reset();
      setPristine(true);
    };
    const closeDialog = () => {
      markPristine();
      requestAnimationFrame(() => {
        contentElement.querySelector<HTMLButtonElement>('[data-dialog-close]')?.click();
      });
    };
    dirtyCtx.markDirty = () => {
      if (!dirtyCtx.dirtyRef.current) {
        dirtyCtx.dirtyRef.current = true;
      }
      setPristine(false);
    };
    dirtyCtx.markPristine = markPristine;
    const onClick = (e: Event) => {
      const btn = (e.target as HTMLElement | null)?.closest?.("button") as HTMLButtonElement | null;
      if (!btn) return;
      const txt = (btn.textContent || "").trim();
      if (txt === "Close" || txt === "Cancel") closeDialog();
      if (ACTION_RX.test(txt)) { markPristine(); return; }
      if (btn.type === "submit" || SAVE_RX.test(txt)) markPristine();
    };

    const scan = () => {
      contentElement.querySelectorAll("button").forEach((b) => {
        const txt = (b.textContent || "").trim();
        const isSave = !ACTION_RX.test(txt) && (b.type === "submit" || SAVE_RX.test(txt));
        if (isSave) b.setAttribute("data-save-intent", "true");
        else b.removeAttribute("data-save-intent");
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(contentElement, { childList: true, subtree: true, characterData: true });

    contentElement.addEventListener("input", markDirty, true);
    contentElement.addEventListener("change", markDirty, true);
    contentElement.addEventListener("click", onClick, true);
    contentElement.addEventListener("submit", markPristine, true);
    return () => {
      dirtyCtx.markDirty = () => { dirtyCtx.dirtyRef.current = true; };
      dirtyCtx.markPristine = () => { dirtyCtx.reset(); };
      mo.disconnect();
      contentElement.removeEventListener("input", markDirty, true);
      contentElement.removeEventListener("change", markDirty, true);
      contentElement.removeEventListener("click", onClick, true);
      contentElement.removeEventListener("submit", markPristine, true);
    };
  }, [contentElement, dirtyCtx]);

  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPortalContainerContext.Provider value={contentElement}>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          ref={handleRef}
          data-pristine={pristine ? "true" : "false"}
          className={cn(
             "dialog-content-centered fixed left-1/2 top-1/2 z-[110] grid grid-cols-[minmax(0,1fr)] h-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto overscroll-contain gap-3 rounded-lg border border-border/60 bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-card-foreground shadow-2xl backdrop-blur-xl data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out sm:gap-4 sm:p-6",
            responsive && "dialog-responsive",
            className,
          )}
          {...props}
        >
          {children}
            <DialogPrimitive.Close data-dialog-close className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-brand hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortalContainerContext.Provider>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="dialog-header" className={cn("flex flex-col space-y-1 pr-12 pb-2 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-footer"
    className={cn("flex flex-row justify-end gap-2 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] [&>*]:min-w-0", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    ref={ref}
    className={cn("text-base font-semibold leading-tight sm:text-lg", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    ref={ref}
    className={cn("hidden text-sm text-muted-foreground sm:block", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export function useDialogDirty() {
  const ctx = React.useContext(DialogDirtyContext);
  return React.useMemo(
    () => ({
      markPristine: () => ctx?.markPristine(),
      markDirty: () => ctx?.markDirty(),
    }),
    [ctx],
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
