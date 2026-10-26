import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filterTree, groupSelection, leaves, setMany, type TreeNode } from "@/lib/selection";
import { Highlight, SearchBox, useDebounced } from "./SearchBox";
import { SelectedReview } from "./SelectedReview";
import { cn } from "@/lib/utils";
import { WindowedList } from "./WindowedList";

function TriBox({ state }: { state: "none" | "some" | "all" }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = state === "some"; }, [state]);
  return <input ref={ref} type="checkbox" tabIndex={-1} aria-hidden readOnly checked={state === "all"} className="size-4 shrink-0 accent-action pointer-events-none" />;
}

type Props = {
  tree: TreeNode[]; selected: Set<string>; onChange: (s: Set<string>) => void;
  searchLabel: string; noun: string; onClose?: (() => void) | undefined; autoFocus?: boolean | undefined;
};

export function TreeChecklist({ tree, selected, onChange, searchLabel, noun, onClose, autoFocus }: Props) {
  const id = useId();
  const [raw, setRaw] = useState("");
  const q = useDebounced(raw);
  const [open, setOpen] = useState<Set<string>>(() => new Set(tree.slice(0, 1).map((n) => n.id)));
  const [active, setActive] = useState(0);
  const visible = useMemo(() => filterTree(tree, q), [tree, q]);
  const visibleLeaves = useMemo(() => leaves(visible), [visible]);
  const allLeaves = useMemo(() => leaves(tree), [tree]);
  const original = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const walk = (ns: TreeNode[]) => ns.forEach((n) => { map.set(n.id, n); if (n.children) walk(n.children); });
    walk(tree); return map;
  }, [tree]);
  const searching = !!q.trim();
  const rows = useMemo(() => {
    const out: { node: TreeNode; depth: number }[] = [];
    const walk = (ns: TreeNode[], depth: number) => ns.forEach((node) => {
      out.push({ node, depth });
      if (node.children && (searching || open.has(node.id))) walk(node.children, depth + 1);
    });
    walk(visible, 0); return out;
  }, [visible, open, searching]);
  useEffect(() => setActive(0), [q]);
  useEffect(() => { document.getElementById(`${id}-row-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active, id]);
  const toggle = (node: TreeNode) => {
    if (raw !== q) return;
    const state = groupSelection(original.get(node.id) ?? node, node, selected);
    onChange(setMany(selected, state.matchingIds, !state.allMatchingSelected));
  };
  const expand = (node: TreeNode) => setOpen((o) => { const next = new Set(o); next.has(node.id) ? next.delete(node.id) : next.add(node.id); return next; });
  const keyboard = (e: KeyboardEvent, index = active, focusRow = false) => {
    const node = rows[index]?.node;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.max(0, Math.min(rows.length - 1, index + (e.key === "ArrowDown" ? 1 : -1)));
      setActive(next); if (focusRow) requestAnimationFrame(() => document.getElementById(`${id}-row-${next}`)?.focus());
    }
    if (node?.children && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault(); setOpen((o) => { const next = new Set(o); e.key === "ArrowRight" ? next.add(node.id) : next.delete(node.id); return next; });
    }
    if (e.key === "Enter" || (focusRow && e.key === " ")) {
      e.preventDefault(); const target = !focusRow && visibleLeaves.length === 1 ? visibleLeaves[0] : node; if (target) toggle(target);
    }
    if (e.key === "Escape") { e.preventDefault(); if (raw) setRaw(""); else onClose?.(); }
  };
  const visibleChecked = visibleLeaves.filter((n) => selected.has(n.id)).length;
  const allVisibleChecked = visibleLeaves.length > 0 && visibleChecked === visibleLeaves.length;
  const hidden = selected.size - visibleChecked;
  const reviewItems = useMemo(() => {
    const result: TreeNode[] = [];
    const walk = (nodes: TreeNode[], path: string[]) => nodes.forEach((node) => {
      if (node.children) walk(node.children, [...path, node.name]);
      else if (selected.has(node.id)) result.push({ ...node, meta: path.join(" › ") });
    });
    walk(tree, []);
    return result;
  }, [tree, selected]);
  return <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-0.5">
    <SearchBox label={searchLabel} value={raw} onChange={setRaw} query={q} shown={visibleLeaves.length} total={allLeaves.length} autoFocus={autoFocus} controls={`${id}-tree`} activeDescendant={rows[active] ? `${id}-row-${active}` : undefined} onKeyDown={(e) => keyboard(e)} />
    <label className="flex shrink-0 items-center gap-2 border-b border-border pb-2 text-sm">
      <input type="checkbox" className="size-4 accent-action" disabled={!visibleLeaves.length || raw !== q} checked={allVisibleChecked} onChange={() => onChange(setMany(selected, visibleLeaves.map((n) => n.id), !allVisibleChecked))} />
      {allVisibleChecked ? "Unselect" : "Select"} {visibleLeaves.length} {searching ? "matching" : "total"} {visibleLeaves.length === 1 ? noun.replace(/s$/, "") : noun}
    </label>
    <WindowedList id={id + "-tree"} label={noun + " list"} role="tree" multiple count={rows.length} active={active}
      rowHeight={64} empty={allLeaves.length ? <>No matches for “{q.trim()}”. Your ticks are kept.</> : <>No {noun} are available.</>}
      renderRow={(i, style) => {
        const { node, depth } = rows[i]!;
        const state = groupSelection(original.get(node.id) ?? node, node, selected);
        const group = !!node.children;
        return <li id={id + "-row-" + i} key={node.id} role="treeitem" aria-level={depth + 1}
          aria-checked={state.state === "some" ? "mixed" : state.state === "all"}
          aria-expanded={group ? searching || open.has(node.id) : undefined}
          tabIndex={i === Math.min(active, rows.length - 1) ? 0 : -1} onFocus={() => setActive(i)} onKeyDown={(event) => keyboard(event, i, true)}
          className={cn("flex items-center gap-1.5 pr-2 cursor-pointer border-b border-border hover:bg-muted",
            state.state === "all" && "bg-active",
            i === active && "outline outline-1 -outline-offset-1 outline-action")}
          style={{ ...style, paddingLeft: depth * 16 + 4 }} onClick={() => toggle(node)}>
          {group ? <Button variant="ghost" size="icon" type="button" tabIndex={-1}
            aria-label={(open.has(node.id) ? "Collapse " : "Expand ") + node.name}
            className="size-6 shrink-0 text-muted-foreground" disabled={searching}
            onClick={(event) => { event.stopPropagation(); expand(node); }}>{searching || open.has(node.id) ? <ChevronDown /> : <ChevronRight />}</Button> : <span className="w-6 shrink-0" />}
          <TriBox state={state.state} />
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate", group && "font-semibold")} title={node.name}><Highlight text={node.name} q={q} /></span>
            {group && <span className="block text-xs text-muted-foreground">{state.selected} of {state.total} selected</span>}
            {group && searching && <span className="block text-xs text-action">{state.allMatchingSelected ? "Unselect" : "Select"} {state.matchingIds.length} matching {state.matchingIds.length === 1 ? noun.replace(/s$/, "") : noun}</span>}
          </span>
          {node.code && <span className="shrink-0 font-mono text-xs text-muted-foreground"><Highlight text={node.code} q={q} /></span>}
        </li>;
      }} />
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-xs">
      <span><strong>{selected.size}</strong> {noun} selected{hidden > 0 && searching && <> · <strong>{hidden}</strong> hidden by search</>}</span>
      {!!selected.size && <Button variant="link" size="sm" className="h-auto px-0 text-action" onClick={() => onChange(new Set())}>Clear selection</Button>}
    </div>
    <SelectedReview compact items={reviewItems} noun={noun} onRemove={(itemId) => onChange(setMany(selected, [itemId], false))} />
  </div>;
}
