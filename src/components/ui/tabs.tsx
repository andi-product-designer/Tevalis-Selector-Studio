import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabsState = { value: string; select: (value: string) => void; id: string };
const TabsContext = React.createContext<TabsState | null>(null);
function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("Tab controls must be inside Tabs");
  return context;
}
const Tabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: string; defaultValue?: string; onValueChange?: (value: string) => void }>(
  ({ value, defaultValue = "", onValueChange, children, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultValue);
    const id = React.useId();
    const select = (next: string) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
    return <TabsContext.Provider value={{ value: value ?? internal, select, id }}><div ref={ref} {...props}>{children}</div></TabsContext.Provider>;
  },
);
Tabs.displayName = "Tabs";
const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} role="tablist" className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />
));
TabsList.displayName = "TabsList";
const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button> & { value: string }>(
  ({ value, className, onClick, onKeyDown, ...props }, ref) => {
    const tabs = useTabs();
    const active = tabs.value === value;
    return <Button ref={ref} variant="ghost" type="button" role="tab" id={`${tabs.id}-tab-${value}`} aria-controls={`${tabs.id}-panel-${value}`} aria-selected={active} tabIndex={active ? 0 : -1} data-state={active ? "active" : "inactive"}
      className={cn("inline-flex h-auto items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className)}
      {...props} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) tabs.select(value); }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        const list = event.currentTarget.closest('[role="tablist"]');
        const buttons = Array.from(list?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []);
        const index = buttons.indexOf(event.currentTarget);
        if (!buttons.length) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next]?.focus(); buttons[next]?.click();
      }} />;
  },
);
TabsTrigger.displayName = "TabsTrigger";
const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ value, className, children, ...props }, ref) => {
    const tabs = useTabs();
    if (tabs.value !== value) return null;
    return <div ref={ref} role="tabpanel" id={`${tabs.id}-panel-${value}`} aria-labelledby={`${tabs.id}-tab-${value}`} tabIndex={0} data-state="active" className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props}>{children}</div>;
  },
);
TabsContent.displayName = "TabsContent";
export { Tabs, TabsList, TabsTrigger, TabsContent };
