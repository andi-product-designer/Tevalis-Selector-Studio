import { useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectedIdentity, textMatches } from "@/lib/selection";
import { Highlight, SearchBox } from "./SearchBox";

type Item = { id: string; name: string; code?: string | undefined; meta?: string | undefined; sub?: string | undefined };

export function SelectedReview({ items, noun, onRemove, compact = false }: {
  items: Item[]; noun: string; onRemove: (id: string) => void; compact?: boolean;
}) {
  const [review, setReview] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const filtered = useMemo(() => items.filter((item) => textMatches(query, item.name, item.id, item.code, item.meta, item.sub)), [items, query]);
  const display = review || (!compact && items.length <= 5);
  const visible = review ? filtered : items;
  const remove = (itemId: string) => {
    const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button[aria-label^="Remove "]') ?? []);
    const index = buttons.findIndex((button) => button.dataset["itemId"] === itemId);
    const next = buttons[index + 1] ?? buttons[index - 1];
    const container = root.current?.parentElement;
    onRemove(itemId);
    requestAnimationFrame(() => {
      if (next?.isConnected) next.focus();
      else if (search.current) search.current.focus();
      else if (toggle.current) toggle.current.focus();
      else container?.querySelector<HTMLElement>('input[type="search"], button[aria-haspopup], button')?.focus();
    });
  };
  if (!items.length) return null;
  return <div ref={root} className="mt-2 flex max-h-44 shrink-0 flex-col overflow-hidden text-xs">
    <Button ref={toggle} type="button" variant="link" size="sm" className="h-auto shrink-0 self-start px-0 text-action"
      aria-expanded={display} aria-controls={id} onClick={() => setReview((value) => !value)}>
      {review ? "Hide selected" : "Review selected"} · {items.length} {noun}
    </Button>
    {review && <div className="mt-2 shrink-0">
      <SearchBox label={"Search selected " + noun} value={query} onChange={setQuery} query={query}
        inputRef={search} shown={filtered.length} total={items.length} controls={id}
        onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); if (query) setQuery(""); else { setReview(false); toggle.current?.focus(); } } }} />
    </div>}
    {display && <ul id={id} aria-label={"Selected " + noun} className="mt-2 min-h-0 max-h-40 overflow-y-auto overscroll-contain divide-y divide-border">
      {!visible.length && <li className="py-2 text-muted-foreground">No selected {noun} match “{query}”. Your selection is unchanged.</li>}
      {visible.map((item) => <li key={item.id} className="flex items-center gap-2 bg-active px-2 py-1">
        <span className="min-w-0 flex-1">
          <span className="block break-words"><Highlight text={item.name} q={review ? query : ""} /> <span className="font-mono text-muted-foreground">({item.code ?? item.id})</span></span>
          {(item.meta || item.sub) && <span className="block text-muted-foreground">{item.meta ?? item.sub}</span>}
        </span>
        <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" data-item-id={item.id}
          aria-label={"Remove " + selectedIdentity({ ...item, id: item.code ?? item.id })} title={"Remove " + (item.code ?? item.id)}
          onClick={() => remove(item.id)}><X /></Button>
      </li>)}
    </ul>}
  </div>;
}
