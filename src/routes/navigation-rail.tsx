import { useSelectionState } from "@/components/selectors/SelectionHistory";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useState } from "react";
import { PageTitle, Panel, Scenarios, ActionButton } from "@/components/selectors/Panel";
import { Highlight, SearchBox, useDebounced } from "@/components/selectors/SearchBox";
import { companyGroups, discounts, promotions, type Rec } from "@/lib/data";
import { textMatches } from "@/lib/selection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/navigation-rail")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Navigation rails – Tevalis prototype" },
      { name: "description", content: "Searchable navigation list beside a details pane that searching never changes." },
      { property: "og:title", content: "Navigation rails – Tevalis prototype" },
      { property: "og:description", content: "Search discounts, promotions and groups without losing edits." },
    ],
  }),
  component: Page,
});

const sets = { Discounts: discounts, Promotions: promotions, "Company Groups": companyGroups } as const;
type Kind = keyof typeof sets;

function Page() {
  const [kind, setKind] = useState<Kind>("Discounts");
  return (
    <>
      <PageTitle crumb="Centralised Management" title="Navigation and Details" intro="Pattern C: filtered rail. Filtering the list never changes the record open on the right." />
      <Tabs value={kind} onValueChange={(value) => { if (value in sets) setKind(value as Kind); }}>
        <TabsList className="mb-3" aria-label="Record type">{(Object.keys(sets) as Kind[]).map((k) => <TabsTrigger key={k} value={k}>{k}</TabsTrigger>)}</TabsList>
      </Tabs>
      <Rail key={kind} kind={kind} records={sets[kind]} />
      <Scenarios items={["Search “D305” to find a discount by ID and open it.", "Edit its name, then search “happy” — the edit stays and a note says the open record is hidden.", "Click “Show it” or clear the search to get back to it."]} />
    </>
  );
}

function Rail({ kind, records }: { kind: Kind; records: readonly Rec[] }) {
  const [data, setData] = useState<Rec[]>([...records]);
  const id = useId();
  const [active, setActive] = useState(0);
  const first = records[0] ?? { id: "", name: "", value: "" };
  const [recordSelection, setRecordSelection] = useSelectionState(`rail:${kind}`, { selId: first.id, draft: first }, `${kind.toLowerCase()} record selection`);
  const { selId } = recordSelection;
  const [draft, setDraft] = useState<Rec>(recordSelection.draft);
  useEffect(() => { setDraft(recordSelection.draft); }, [recordSelection]);
  const [raw, setRaw] = useState("");
  const q = useDebounced(raw);
  const list = useMemo(() => data.filter((r) => textMatches(q, r.name, r.id)), [data, q]);
  const current = data.find((r) => r.id === selId) ?? first;
  const dirty = draft.name !== current.name || draft.value !== current.value;
  const hidden = !list.some((r) => r.id === selId);

  const open = (r: Rec) => {
    if (dirty && !window.confirm(`Discard unsaved changes to ${current.name}?`)) return;
    setRecordSelection({ selId: r.id, draft: r }); setDraft(r);
  };

  return (
    <div className="grid gap-3 md:grid-cols-[280px_1fr]">
      <Panel title="Navigation">
        <SearchBox label={`Search ${kind.toLowerCase()} by name or ID`} value={raw} onChange={(value) => { setRaw(value); setActive(0); }} query={q} shown={list.length} total={data.length} controls={`${id}-list`} activeDescendant={list[active] ? `${id}-option-${active}` : undefined}
          onKeyDown={(e) => { if (e.key === "Escape") setRaw(""); if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, Math.min(list.length - 1, a + (e.key === "ArrowDown" ? 1 : -1)))); } if (e.key === "Enter") { const record = list.length === 1 ? list[0] : list[active]; if (record) open(record); } }} />
        {hidden && (
          <p className="mt-2 bg-warn p-2 text-xs text-warn-foreground">
            Open record “{current.name}” is hidden by this search{dirty && " and has unsaved changes"}. <Button variant="link" size="sm" className="h-auto px-0 underline" onClick={() => setRaw("")}>Show it</Button>
          </p>
        )}
        <ul id={`${id}-list`} className="mt-2 max-h-96 overflow-auto text-sm" role="listbox" aria-label={kind}>
          {list.map((r, i) => (
            <li id={`${id}-option-${i}`} tabIndex={i === active ? 0 : -1} onFocus={() => setActive(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(r); } if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const next = Math.max(0, Math.min(list.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))); setActive(next); document.getElementById(`${id}-option-${next}`)?.focus(); } }} key={r.id} role="option" aria-selected={r.id === selId} onClick={() => open(r)}
              className={cn("flex cursor-pointer items-center justify-between border-l-4 px-2 py-1.5", r.id === selId ? "border-action bg-active font-semibold" : "border-transparent hover:bg-muted")}>
              <span className="min-w-0 flex-1 break-words"><Highlight text={r.name} q={q} /></span><span className="shrink-0 pl-2 font-mono text-xs text-muted-foreground"><Highlight text={r.id} q={q} /></span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title={`Details – ${current.id}${dirty ? " (unsaved)" : ""}`}>
        <label className="block text-sm">Name</label>
        <input className="mb-3 h-8 w-full border border-input px-2 text-sm" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <label className="block text-sm">Value</label>
        <input className="mb-4 h-8 w-48 border border-input px-2 text-sm" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
        <div className="flex gap-2">
          <ActionButton disabled={!dirty} onClick={() => setData((d) => d.map((r) => (r.id === selId ? draft : r)))}>Save</ActionButton>
          {dirty && <Button variant="link" className="text-sm underline" onClick={() => setDraft(current)}>Undo changes</Button>}
        </div>
      </Panel>
    </div>
  );
}
