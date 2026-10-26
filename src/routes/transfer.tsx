import { useSelectionState } from "@/components/selectors/SelectionHistory";
import { createFileRoute } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTitle, Panel, Scenarios } from "@/components/selectors/Panel";
import { Highlight, SearchBox, useDebounced } from "@/components/selectors/SearchBox";
import { managerFunctions } from "@/lib/data";
import { moveInOrder, textMatches, transfer } from "@/lib/selection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transfer")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Available and In Use lists – Tevalis prototype" },
      { name: "description", content: "Dual-list transfer for Manager Functions with a search box on each side." },
      { property: "og:title", content: "Available and In Use lists – Tevalis prototype" },
      { property: "og:description", content: "Move functions between lists and reorder the full order." },
    ],
  }),
  component: Page,
});

const name = (id: string) => managerFunctions.find((f) => f.id === id)?.name ?? id;

function Page() {
  const [membership, setMembership] = useSelectionState("transfer:lists", { avail: managerFunctions.slice(4).map((f) => f.id), use: managerFunctions.slice(0, 4).map((f) => f.id) }, "function transfer or ordering");
  const { avail, use } = membership;
  const [pick, setPick] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const a = useFilter(avail);
  const u = useFilter(use);

  const toUse = () => { if (pick && avail.includes(pick)) { const r = transfer(avail, use, [pick]); setMembership({ avail: r.from, use: r.to }); setMsg(`${name(pick)} moved to In Use${u.q.trim() && !textMatches(u.q, name(pick), pick) ? " — hidden by the In Use search" : ""}.`); } };
  const toAvail = () => { if (pick && use.includes(pick)) { const r = transfer(use, avail, [pick]); setMembership({ avail: r.to, use: r.from }); setMsg(`${name(pick)} moved to Available${a.q.trim() && !textMatches(a.q, name(pick), pick) ? " — hidden by the Available search" : ""}.`); } };
  const canAdd = !!pick && avail.includes(pick);
  const canRemove = !!pick && use.includes(pick);
  const position = pick ? use.indexOf(pick) : -1;
  const move = (dir: -1 | 1) => {
    if (!pick || !use.includes(pick)) return;
    const next = moveInOrder(use, pick, dir);
    setMembership({ avail, use: next });
    setMsg(`${name(pick)} is now position ${next.indexOf(pick) + 1} of ${next.length} in the full order.`);
  };

  return (
    <>
      <PageTitle crumb="Centralised Management › Manager Functions" title="Manager Functions" intro="Pattern D: each list has its own search. Up/down arrows move items in the full, unfiltered order." />
      <div className="grid items-start gap-3 md:grid-cols-[1fr_auto_1fr_auto]">
        <List title="Available Functions" f={a} pick={pick} setPick={setPick} onDouble={toUse} />
        <div className="flex flex-row flex-wrap gap-2 md:mt-24 md:flex-col">
          <Button type="button" variant="ghost" aria-label="Add to In Use" disabled={!canAdd} onClick={toUse} className="h-auto min-h-9 px-3 py-2 bg-action text-action-foreground"><ChevronRight />Add to In Use</Button>
          <Button type="button" variant="ghost" aria-label="Remove from In Use" disabled={!canRemove} onClick={toAvail} className="h-auto min-h-9 px-3 py-2 border border-border"><ChevronLeft />Remove</Button>
        </div>
        <List title="Functions In Use" f={u} pick={pick} setPick={setPick} onDouble={toAvail} numbered order={use} />
        <div className="flex flex-row gap-2 md:mt-24 md:flex-col">
          <Button type="button" variant="ghost" aria-label="Move up" disabled={position <= 0} onClick={() => move(-1)} className="grid size-9 place-items-center border border-border bg-card"><ArrowUp /></Button>
          <Button type="button" variant="ghost" aria-label="Move down" disabled={position < 0 || position >= use.length - 1} onClick={() => move(1)} className="grid size-9 place-items-center border border-border bg-card"><ArrowDown /></Button>
        </div>
      </div>
      <p className="mt-3 min-h-5 text-sm" role="status">{msg}</p>
      <Scenarios items={["Search “discount” in Available while In Use has the search “void”; move one across and read where it went.", "Filter In Use, then move a function up — the message gives its position in the full order."]} />
    </>
  );
}

function useFilter(ids: string[]) {
  const [raw, setRaw] = useState("");
  const q = useDebounced(raw);
  const shown = useMemo(() => ids.filter((id) => textMatches(q, name(id), id)), [ids, q]);
  return { raw, setRaw, q, shown, total: ids.length };
}

function List({ title, f, pick, setPick, onDouble, numbered, order }: { title: string; f: ReturnType<typeof useFilter>; pick: string | null; setPick: (s: string) => void; onDouble: () => void; numbered?: boolean; order?: string[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  return (
    <Panel title={title}>
      <SearchBox label={`Search ${title.toLowerCase()}`} value={f.raw} onChange={(value) => { f.setRaw(value); setActive(0); }} query={f.q} shown={f.shown.length} total={f.total} controls={`${id}-list`} activeDescendant={f.shown[active] ? `${id}-option-${active}` : undefined} onKeyDown={(e) => { if (e.key === "Escape") f.setRaw(""); if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, Math.min(f.shown.length - 1, a + (e.key === "ArrowDown" ? 1 : -1)))); } if (e.key === "Enter") { const target = f.shown.length === 1 ? f.shown[0] : f.shown[active]; if (target) setPick(target); } }} />
      <ul id={`${id}-list`} className="mt-2 h-80 overflow-auto border border-border text-sm" role="listbox" aria-label={title}>
        {f.shown.map((itemId, i) => (
          <li id={`${id}-option-${i}`} tabIndex={i === Math.min(active, f.shown.length - 1) ? 0 : -1} onFocus={() => setActive(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPick(itemId); } if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const next = Math.max(0, Math.min(f.shown.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))); setActive(next); document.getElementById(`${id}-option-${next}`)?.focus(); } }} key={itemId} role="option" aria-selected={pick === itemId} onClick={() => setPick(itemId)} onDoubleClick={onDouble}
            className={cn("flex cursor-pointer gap-2 px-2 py-1", pick === itemId ? "bg-action text-action-foreground" : "hover:bg-muted")}>
            {numbered && order && <span className="w-6 text-right text-xs opacity-70">{order.indexOf(itemId) + 1}</span>}
            <Highlight text={name(itemId)} q={f.q} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
