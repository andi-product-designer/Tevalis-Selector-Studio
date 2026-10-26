import { useSelectionState } from "@/components/selectors/SelectionHistory";
import { createFileRoute } from "@tanstack/react-router";
import { useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectedReview } from "@/components/selectors/SelectedReview";
import { ChevronDown } from "lucide-react";
import { PageTitle, Panel, Scenarios } from "@/components/selectors/Panel";
import { Highlight, SearchBox, useDebounced } from "@/components/selectors/SearchBox";
import { priceGroups, sites } from "@/lib/data";
import { setMany, textMatches } from "@/lib/selection";
import { cn } from "@/lib/utils";
import { SelectorPopup } from "@/components/selectors/SelectorPopup";

export const Route = createFileRoute("/checklists")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Checklist dropdowns – Tevalis prototype" },
      { name: "description", content: "Runs At Sites and Price Groups checklists with pinned search and a full summary of ticks." },
      { property: "og:title", content: "Checklist dropdowns – Tevalis prototype" },
      { property: "og:description", content: "Tick across several searches and see everything selected." },
    ],
  }),
  component: Page,
});

type Item = { id: string; name: string; sub?: string };

function Page() {
  const [runs, setRuns] = useSelectionState<Set<string>>("checklists:runs", new Set(), "promotion sites selection");
  const [pg, setPg] = useSelectionState<Set<string>>("checklists:prices", new Set(["PG1"]), "price groups selection");
  const siteItems = useMemo(() => sites.map((s) => ({ id: s.id, name: s.name, sub: s.area })), []);
  return (
    <>
      <PageTitle crumb="Centralised Management › Promotions" title="Pint & Pizza (PR73)" intro="Pattern C: checklist dropdowns. Search is pinned at the top; closing the list shows everything ticked, including ticks made in earlier searches." />
      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Runs At Sites"><CheckDropdown label="Runs At Sites" noun="sites" items={siteItems} sel={runs} setSel={setRuns} /></Panel>
        <Panel title="Price Groups"><CheckDropdown label="Price Groups" noun="price groups" items={priceGroups} sel={pg} setSel={setPg} /></Panel>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Promotion Price Group follows whichever selection mode the real screen uses (one or many) — to confirm in the audit. Search reopens empty each time; ticks are always kept.</p>
      <Scenarios items={["Search “leeds”, tick two sites. Search “glasgow”, tick one. Close the list — all three are listed.", "Remove a site from the summary with its ×.", "Search something with no results and see the message differ from an empty list."]} />
    </>
  );
}

function CheckDropdown({ label, noun, items, sel, setSel }: { label: string; noun: string; items: Item[]; sel: Set<string>; setSel: (s: Set<string>) => void }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const q = useDebounced(raw);
  const [active, setActive] = useState(0);
  const list = useMemo(() => items.filter((i) => textMatches(q, i.name, i.id)), [items, q]);
  const chosen = items.filter((i) => sel.has(i.id));
  const allShown = list.length > 0 && list.every((i) => sel.has(i.id));
  const hidden = chosen.filter((c) => !list.includes(c)).length;
  const toggle = (i?: Item) => i && setSel(setMany(sel, [i.id], !sel.has(i.id)));
  return (
    <div className="relative">
      <Button ref={trigger} variant="outline" type="button" aria-label={label} aria-controls={`${id}-picker`} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setOpen((o) => !o); setRaw(""); setActive(0); }}
        className="flex h-9 w-full items-center justify-between border border-input px-2 text-sm">
        <span>{sel.size ? `${sel.size} ${noun} selected` : `No ${noun} selected`}</span><ChevronDown className="size-4" />
      </Button>
      {open && (
        <SelectorPopup anchor={trigger} id={`${id}-picker`} label={label} onClose={() => setOpen(false)}>
          <div className="shrink-0 space-y-2 border-b border-border bg-popover p-2">
            <SearchBox label={`Search ${noun}`} value={raw} onChange={(v) => { setRaw(v); setActive(0); }} query={q} shown={list.length} total={items.length} autoFocus controls={`${id}-list`} activeDescendant={list[active] ? `${id}-option-${active}` : undefined}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(list.length - 1, a + 1)); }
                if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                if (e.key === "Enter") toggle(list.length === 1 ? list[0] : list[active]);
                if (e.key === "Escape") { if (raw) setRaw(""); else close(); }
              }} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-action" disabled={!list.length} checked={allShown} onChange={() => setSel(setMany(sel, list.map((i) => i.id), !allShown))} />
              {allShown ? "Uncheck" : "Check"} all {list.length} shown
            </label>
          </div>
          <ul id={`${id}-list`} aria-label={noun} className="min-h-0 max-h-64 flex-auto overflow-auto overscroll-contain text-sm" role="listbox" aria-multiselectable>
            {list.map((i, idx) => (
              <li id={`${id}-option-${idx}`} tabIndex={idx === active ? 0 : -1} onFocus={() => setActive(idx)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(i); } if (e.key === "Escape") { if (raw) setRaw(""); else close(); } if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const next = Math.max(0, Math.min(list.length - 1, idx + (e.key === "ArrowDown" ? 1 : -1))); setActive(next); document.getElementById(`${id}-option-${next}`)?.focus(); } }} key={i.id} role="option" aria-selected={sel.has(i.id)} onMouseEnter={() => setActive(idx)} onClick={() => toggle(i)}
                className={cn("flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-muted", sel.has(i.id) && "bg-active", idx === active && "outline outline-1 -outline-offset-1 outline-action")}>
                <input type="checkbox" readOnly tabIndex={-1} checked={sel.has(i.id)} className="pointer-events-none size-4 accent-action" />
                <span className="min-w-0 flex-1"><span className="block truncate" title={i.name}><Highlight text={i.name} q={q} /></span>{i.sub && <span className="block text-xs text-muted-foreground">{i.sub}</span>}</span>
                <span className="font-mono text-xs text-muted-foreground"><Highlight text={i.id} q={q} /></span>
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border p-2 text-xs">
            <span>{sel.size} selected{hidden > 0 && q.trim() && ` · ${hidden} hidden by search`}</span>
            <Button variant="link" size="sm" className="h-auto px-0 text-action" onClick={close}>Done · {sel.size} {noun} selected</Button>
          </div>
        </SelectorPopup>
      )}
      {!open && <SelectedReview items={chosen} noun={noun} onRemove={(itemId) => setSel(setMany(sel, [itemId], false))} />}
    </div>
  );
}
