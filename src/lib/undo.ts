export type HistoryEntry = { key: string; before: unknown; after: unknown; label: string; path: string };
export type UndoState = { values: Record<string, unknown>; past: HistoryEntry[]; message: string };
export const initialUndoState: UndoState = { values: {}, past: [], message: "" };
export function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every((id) => b.has(id));
  return JSON.stringify(a) === JSON.stringify(b);
}
export function commitChange(state: UndoState, entry: HistoryEntry): UndoState {
  if (sameValue(entry.before, entry.after)) return state;
  const snapshot = { ...entry, before: structuredClone(entry.before), after: structuredClone(entry.after) };
  return { values: { ...state.values, [entry.key]: structuredClone(snapshot.after) }, past: [...state.past, snapshot].slice(-50), message: "" };
}
export function undoChange(state: UndoState): UndoState {
  const entry = state.past.at(-1);
  if (!entry) return state;
  return { values: { ...state.values, [entry.key]: structuredClone(entry.before) }, past: state.past.slice(0, -1), message: `Undid ${entry.label}.` };
}