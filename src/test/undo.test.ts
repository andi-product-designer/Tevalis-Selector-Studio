import { describe, expect, it } from "vitest";
import { commitChange, initialUndoState, undoChange } from "@/lib/undo";
describe("selection recovery", () => {
  it("keeps history independent of later mutable selection edits", () => {
    const before = new Set(["S1001"]);
    const after = new Set(["S1001", "S1013"]);
    const state = commitChange(initialUndoState, { key: "sites", before, after, path: "/sites-report", label: "sites" });
    before.clear(); after.clear();
    expect(undoChange(state).values['sites']).toEqual(new Set(["S1001"]));
    expect(state.values['sites']).toEqual(new Set(["S1001", "S1013"]));
  });
  it("restores the exact selection before a bulk action", () => {
    const state = commitChange(initialUndoState, { key: "sites", before: new Set(["S1001"]), after: new Set(["S1001", "S1013"]), path: "/sites-report", label: "sites" });
    expect(undoChange(state).values['sites']).toEqual(new Set(["S1001"]));
  });
  it("restores both transfer lists and full ordering atomically", () => {
    const before = { avail: ["F5", "F6"], use: ["F1", "F2"] };
    const state = commitChange(initialUndoState, { key: "transfer", before, after: { avail: ["F6"], use: ["F2", "F1", "F5"] }, path: "/transfer", label: "transfer" });
    expect(undoChange(state).values['transfer']).toEqual(before);
  });
  it("undoes chronologically across different lists and ignores no-ops", () => {
    const a = commitChange(initialUndoState, { key: "sites", before: null, after: "S1001", path: "/menu-push", label: "site" });
    const b = commitChange(a, { key: "products", before: new Set(), after: new Set(["P2001"]), path: "/discounted-products", label: "products" });
    const noOp = commitChange(b, { key: "products", before: new Set(["P2001"]), after: new Set(["P2001"]), path: "/discounted-products", label: "products" });
    expect(noOp.past).toHaveLength(2);
    expect(undoChange(undoChange(noOp)).values).toEqual({ sites: null, products: new Set() });
  });
});
