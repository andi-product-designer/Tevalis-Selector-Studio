import { createContext, useContext, useRef, useState, type ReactNode, type SetStateAction } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { commitChange, initialUndoState, undoChange, type UndoState } from "@/lib/undo";

type History = { state: UndoState; commit: (key: string, initial: unknown, next: SetStateAction<unknown>, label: string, path: string) => void; undo: () => void };
const HistoryContext = createContext<History | null>(null);
export function SelectionHistoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialUndoState);
  const ref = useRef(state);
  const update = (next: UndoState) => { ref.current = next; setState(next); };
  const commit: History["commit"] = (key, initial, next, label, path) => {
    const current = ref.current;
    const before = Object.hasOwn(current.values, key) ? current.values[key] : initial;
    const after = typeof next === "function" ? next(before) : next;
    update(commitChange(current, { key, before, after, label, path }));
  };
  return <HistoryContext.Provider value={{ state, commit, undo: () => update(undoChange(ref.current)) }}>{children}</HistoryContext.Provider>;
}
export function useSelectionState<T>(key: string, initial: T | (() => T), label: string): [T, (next: SetStateAction<T>) => void] {
  const context = useContext(HistoryContext);
  const fallback = useRef<T | undefined>(undefined);
  const [local, setLocal] = useState(initial);
  if (fallback.current === undefined) fallback.current = local;
  const path = useLocation().pathname;
  if (!context) return [local, setLocal];
  const value = Object.hasOwn(context.state.values, key) ? context.state.values[key] as T : fallback.current;
  return [value as T, (next) => context.commit(key, fallback.current, next as SetStateAction<unknown>, label, path)];
}
export function SelectionUndo() {
  const context = useContext(HistoryContext);
  const navigate = useNavigate();
  if (!context) return null;
  const recent = context.state.past.at(-1);
  return <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-border pb-3 text-xs">
    <Button variant="outline" size="sm" disabled={!recent} title={recent ? `Undo ${recent.label}` : "No selection changes to undo"} onClick={() => { context.undo(); if (recent) void navigate({ to: recent.path }); }}><Undo2 className="size-4" />Undo</Button>
    <span className="text-muted-foreground">{recent ? recent.label : "No recent selection changes"}</span>
    <span role="status" className="text-action">{context.state.message}</span>
  </div>;
}