import { useSelectionState } from "@/components/selectors/SelectionHistory";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { ActionButton, PageTitle, Panel, Scenarios } from "@/components/selectors/Panel";
import { Highlight, SearchBox, useDebounced } from "@/components/selectors/SearchBox";
import { sites, type Site } from "@/lib/data";
import { textMatches } from "@/lib/selection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu-push")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Choose a site for a menu push – Tevalis prototype" },
      { name: "description", content: "Searchable single-site picker with a separate confirm step before pushing menus." },
      { property: "og:title", content: "Choose a site for a menu push – Tevalis prototype" },
      { property: "og:description", content: "Tell look-alike sites apart and confirm before pushing." },
    ],
  }),
  component: Page,
});

function Page() {
  const trigger = useRef<HTMLButtonElement>(null);
  const pushTrigger = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const [dest, setDest] = useSelectionState<Site | null>("menu-push:destination", null, "menu destination selection");
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const q = useDebounced(raw);
  const [active, setActive] = useState(0);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (confirm) confirmButton.current?.focus(); }, [confirm]);
  const closeConfirmation = () => { setConfirm(false); pushTrigger.current?.focus(); };
  const [pushed, setPushed] = useState<string | null>(null);
  const list = useMemo(() => sites.filter((s) => textMatches(q, s.name, s.id, s.area)), [q]);

  useEffect(() => { setConfirm(false); setPushed(null); }, [dest]);

  const pick = (s: Site | undefined) => { if (s) { setConfirm(false); setDest(s); close(); setRaw(""); setPushed(null); } };

  return (
    <>
      <PageTitle crumb="EPOS Designer 2017 › Site Menus" title="Select a site" intro="Pattern B: single select. Picking a site only sets the destination — pushing is a separate, confirmed step. Enter never pushes." />
      <div className="max-w-2xl">
        <Panel title="Push menu: Autumn Food 2026">
          <label className="block text-sm" id="dest-label">Destination site</label>
          <div className="relative">
            <Button ref={trigger} variant="outline" type="button" aria-labelledby="dest-label" aria-controls="destination-picker" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setOpen((o) => !o); setActive(0); }}
              className="flex min-h-9 h-auto w-full items-center justify-between border border-input px-2 text-left text-sm whitespace-normal">
              {dest ? <span className="min-w-0 break-words">{dest.name} <span className="font-mono text-xs text-muted-foreground">{dest.id} · {dest.area}</span></span> : <span className="italic">No site selected</span>}
              <ChevronDown className="size-4" />
            </Button>
            {open && (
              <div id="destination-picker" role="dialog" aria-label="Choose destination" className="absolute z-10 mt-0.5 w-full border border-border bg-popover shadow-lg">
                <div className="border-b border-border p-2">
                  <SearchBox label="Search sites by name, ID or area" value={raw} onChange={(v) => { setRaw(v); setActive(0); }} query={q} shown={list.length} total={sites.length} autoFocus controls="dest-list" activeDescendant={list[active] ? `dest-option-${active}` : undefined}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(list.length - 1, a + 1)); }
                      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                      if (e.key === "Enter") pick(list.length === 1 ? list[0] : list[active]);
                      if (e.key === "Escape") { if (raw) setRaw(""); else close(); }
                    }} />
                </div>
                <ul id="dest-list" aria-label="Destination sites" role="listbox" className="max-h-72 overflow-auto text-sm">
                  {list.map((s, i) => (
                    <li id={`dest-option-${i}`} tabIndex={i === active ? 0 : -1} onFocus={() => setActive(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(s); } if (e.key === "Escape") { if (raw) setRaw(""); else close(); } if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const next = Math.max(0, Math.min(list.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))); setActive(next); document.getElementById(`dest-option-${next}`)?.focus(); } }} key={s.id} role="option" aria-selected={dest?.id === s.id} onMouseEnter={() => setActive(i)} onClick={() => pick(s)}
                      className={cn("flex cursor-pointer items-center gap-2 px-3 py-1.5", i === active && "bg-active")}>
                      <span className="w-4">{dest?.id === s.id && <Check className="size-4 text-action" />}</span>
                      <span className="flex-1"><Highlight text={s.name} q={q} /></span>
                      <span className="font-mono text-xs text-muted-foreground"><Highlight text={s.id} q={q} /></span>
                      <span className="w-28 text-right text-xs text-muted-foreground">{s.area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button ref={pushTrigger} disabled={!dest} className="bg-action text-action-foreground" onClick={() => setConfirm(true)}>Push menu…</Button>
            {pushed && <span className="text-sm" role="status">{pushed}</span>}
          </div>
          {confirm && dest && (
            <div role="region" aria-label="Confirm push" onKeyDown={(e) => { if (e.key === "Escape") closeConfirmation(); }} className="mt-4 border border-action bg-active p-3 text-sm">
              <p>Push <strong>Autumn Food 2026</strong> to <strong>{dest.name}</strong> ({dest.id}, {dest.region} › {dest.area})?</p>
              <div className="mt-3 flex gap-2">
                <Button ref={confirmButton} className="bg-action text-action-foreground" onClick={() => { closeConfirmation(); setPushed(`Pretend push sent to ${dest.name} (${dest.id}).`); }}>Confirm push</Button>
                <Button variant="link" className="px-3 text-sm underline" onClick={closeConfirmation}>Cancel</Button>
              </div>
            </div>
          )}
        </Panel>
      </div>
      <Scenarios items={["Search “crown – leeds” — several look-alike sites show their ID and area so you can pick the right one.", "Type a search then press Esc twice: the search clears, then the list closes, and the destination is unchanged.", "Pick a site with Enter — nothing is pushed until you confirm."]} />
    </>
  );
}
