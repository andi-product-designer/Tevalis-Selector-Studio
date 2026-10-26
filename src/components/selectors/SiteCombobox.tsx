import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { textMatches } from "@/lib/selection";
import type { Site } from "@/lib/data";
import { Highlight, useDebounced } from "./SearchBox";
import { SelectorPopup } from "./SelectorPopup";
import { WindowedList } from "./WindowedList";
import { cn } from "@/lib/utils";

export function SiteCombobox({ sites, value, onChange }: { sites: Site[]; value: Site | null; onChange: (site: Site) => void }) {
  const id = useId();
  const anchor = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const q = useDebounced(raw);
  const [active, setActive] = useState(0);
  const list = useMemo(() => sites.filter((site) => textMatches(q, site.name, site.id, site.area, site.region)), [sites, q]);
  const pending = raw !== q;
  const close = () => { setOpen(false); setRaw(""); };
  const pick = (site: Site | undefined) => {
    if (!site || pending) return;
    onChange(site); close(); input.current?.focus();
  };
  useEffect(() => { setActive(0); }, [q]);
  return <div>
    <label htmlFor={id} className="mb-1 block text-sm">Destination site</label>
    <div ref={anchor} className="relative flex items-center">
      <Search aria-hidden className="pointer-events-none absolute left-2 size-4 text-muted-foreground" />
      <input ref={input} id={id} role="combobox" aria-autocomplete="list" aria-expanded={open}
        aria-controls={open ? id + "-list" : undefined}
        aria-activedescendant={open && !pending && list[active] ? id + "-option-" + active : undefined}
        aria-describedby={id + "-selection"} autoComplete="off"
        placeholder="Search sites by name, ID or location"
        value={open ? raw : value?.name ?? ""}
        onClick={() => { if (!open) { setOpen(true); setRaw(""); setActive(0); } }}
        onChange={(event) => { setRaw(event.target.value); setActive(0); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) { setRaw(""); setOpen(true); setActive(0); return; }
            setActive((current) => Math.max(0, Math.min(list.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))));
          }
          if (event.key === "Enter") { event.preventDefault(); if (open) pick(list.length === 1 ? list[0] : list[active]); }
          if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); if (raw) setRaw(""); else close(); }
          if (event.key === "Tab") close();
        }}
        className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-16 text-sm focus-visible:outline-2 focus-visible:outline-action" />
      {open && raw && <Button type="button" variant="ghost" size="icon" aria-label="Clear site search"
        className="absolute right-8 size-7" onMouseDown={(event) => event.preventDefault()}
        onClick={() => { setRaw(""); input.current?.focus(); }}><X /></Button>}
      <Button type="button" variant="ghost" size="icon" tabIndex={-1} aria-label={open ? "Close site list" : "Open site list"}
        aria-expanded={open} className="absolute right-0 size-8" onMouseDown={(event) => event.preventDefault()}
        onClick={() => { setOpen(!open); setRaw(""); setActive(0); input.current?.focus(); }}><ChevronDown /></Button>
    </div>
    <p id={id + "-selection"} className="mt-1 text-xs text-muted-foreground">
      {value ? <><strong className="text-foreground">{value.id}</strong> · {value.region} › {value.area}</> : "Choose a destination before pushing the menu."}
    </p>
    {open && <SelectorPopup anchor={anchor} id={id + "-popup"} label="Destination sites" role="presentation" onClose={close}>
      <p role="status" className="shrink-0 border-b border-border px-3 py-2 text-xs text-muted-foreground">
        {pending ? "Filtering…" : list.length + " of " + sites.length + " sites"}
      </p>
      <WindowedList count={list.length} active={active} id={id + "-list"} label="Destination sites" role="listbox"
        empty={<>No matches for “{q.trim()}”. Try a site name, ID or location. Your destination is unchanged.</>}
        renderRow={(index, style) => {
          const site = list[index]!;
          return <li key={site.id} id={id + "-option-" + index} role="option" aria-selected={value?.id === site.id}
            aria-posinset={index + 1} aria-setsize={list.length} style={style}
            onMouseDown={(event) => event.preventDefault()} onClick={() => pick(site)}
            className={cn("flex cursor-pointer items-center gap-2 border-b border-border px-3 hover:bg-muted",
              value?.id === site.id && "bg-active", index === active && "outline outline-1 -outline-offset-1 outline-action")}>
            <span className="w-4 shrink-0">{value?.id === site.id && <Check aria-hidden className="size-4" />}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold" title={site.name}><Highlight text={site.name} q={q} /></span>
              <span className="block truncate text-xs text-muted-foreground" title={site.region + " › " + site.area}><Highlight text={site.region + " › " + site.area} q={q} /></span>
            </span>
            <span className="shrink-0 font-mono text-xs"><Highlight text={site.id} q={q} /></span>
          </li>;
        }} />
      <p className="shrink-0 border-t border-border px-3 py-2 text-xs text-muted-foreground">Enter selects a site. Pushing the menu is a separate step.</p>
    </SelectorPopup>}
  </div>;
}
