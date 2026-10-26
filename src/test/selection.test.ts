import { describe, expect, it } from "vitest";
import { filterTree, leaves, setMany, transfer, moveInOrder, groupSelection, selectedIdentity, priceMatches, type TreeNode } from "@/lib/selection";

const tree: TreeNode[] = [
  { id: "r1", name: "Yorkshire", children: [{ id: "s1", name: "Guys Testing", code: "S1" }, { id: "s2", name: "Guys Testing 2", code: "S2" }, { id: "s3", name: "Leeds", code: "S3" }] },
  { id: "r2", name: "London", children: [{ id: "s4", name: "Soho", code: "S4" }] },
];

describe("selection rules", () => {
  it("shows 7 of 8 and mixed Draught state after unchecking the sole Guinness match", () => {
    const draught: TreeNode = { id: "draught", name: "Draught", children: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, name: i === 0 ? "Guinness" : `Beer ${i}` })) };
    const shown = filterTree([draught], "guinness")[0];
    if (!shown) throw new Error("Missing match");
    const sel = setMany(new Set(leaves([draught]).map((n) => n.id)), ["p0"], false);
    expect(groupSelection(draught, shown, sel)).toEqual({ state: "some", selected: 7, total: 8, matchingIds: ["p0"], allMatchingSelected: false });
  });
  it("filtered Yorkshire action selects four matches but overall state stays 4 of 50", () => {
    const yorkshire: TreeNode = { id: "y", name: "Yorkshire", children: Array.from({ length: 50 }, (_, i) => ({ id: `s${i}`, name: i < 4 ? `Guys ${i}` : `Site ${i}` })) };
    const shown = filterTree([yorkshire], "guys")[0];
    if (!shown) throw new Error("Missing match");
    const ids = groupSelection(yorkshire, shown, new Set()).matchingIds;
    const result = groupSelection(yorkshire, shown, setMany(new Set(), ids, true));
    expect([result.state, result.selected, result.total]).toEqual(["some", 4, 50]);
  });
  it("retains S1001 and S1013 in duplicate site identities", () => {
    expect(selectedIdentity({ name: "The Crown – Leeds", id: "S1001" })).toBe("The Crown – Leeds (S1001)");
    expect(selectedIdentity({ name: "The Crown – Leeds", id: "S1013" })).toBe("The Crown – Leeds (S1013)");
  });
  it("matches the displayed £6.20 price as well as 6.20", () => {
    const p = { name: "Corona", code: "SC2010", price: 6.2 };
    expect(priceMatches("£6.20", p)).toBe(true);
    expect(priceMatches("6.20", p)).toBe(true);
    expect(priceMatches("£6.21", p)).toBe(false);
  });
  it("keeps ticks after the search is cleared", () => {
    let sel = setMany(new Set(), ["s1"], true);
    const visible = leaves(filterTree(tree, "soho")).map((x) => x.id);
    sel = setMany(sel, visible, true);
    expect([...sel].sort()).toEqual(["s1", "s4"]);
  });
  it("matching child reveals ancestor; matching parent reveals all children", () => {
    expect(leaves(filterTree(tree, "leeds")).map((x) => x.id)).toEqual(["s3"]);
    expect(leaves(filterTree(tree, "yorkshire")).length).toBe(3);
    expect(leaves(filterTree(tree, "s4")).map((x) => x.id)).toEqual(["s4"]);
  });
  it("check all only affects what is shown", () => {
    const visible = leaves(filterTree(tree, "guys")).map((x) => x.id);
    expect([...setMany(new Set(["s4"]), visible, true)].sort()).toEqual(["s1", "s2", "s4"]);
  });
  it("transfer removes from source membership", () => {
    expect(transfer(["a", "b", "c"], ["x"], ["b"])).toEqual({ from: ["a", "c"], to: ["x", "b"] });
  });
  it("reorder acts on the full order", () => {
    expect(moveInOrder(["a", "b", "c"], "c", -1)).toEqual(["a", "c", "b"]);
    expect(moveInOrder(["a", "b"], "a", -1)).toEqual(["a", "b"]);
  });
});
