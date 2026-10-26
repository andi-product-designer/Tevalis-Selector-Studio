import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { SiteCombobox } from "@/components/selectors/SiteCombobox";
import { SelectedReview } from "@/components/selectors/SelectedReview";
import { TreeChecklist } from "@/components/selectors/TreeChecklist";
import { createSiteCatalogue, createSiteTree } from "@/lib/site-catalogue";
import { filterTree, leaves } from "@/lib/selection";
import type { Site } from "@/lib/data";

afterEach(cleanup);
const sites: Site[] = [
  { id: "S1", name: "The Crown", region: "North", area: "Leeds" },
  { id: "S2", name: "The Crown", region: "South", area: "London" },
];
function Combo() {
  const [value, setValue] = useState<Site | null>(sites[0]!);
  return <><SiteCombobox sites={sites} value={value} onChange={setValue} /><output aria-label="Chosen ID">{value?.id}</output></>;
}
describe("site destination combobox", () => {
  it("selects a duplicate name by ID using Enter and returns focus to the input", async () => {
    render(<Combo />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "S2" } });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("option")).toHaveTextContent("London");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByLabelText("Chosen ID")).toHaveTextContent("S2");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveFocus();
  });
  it("Escape clears a query, then closes without changing the selected destination", async () => {
    render(<Combo />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "London" } });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("The Crown");
    expect(screen.getByLabelText("Chosen ID")).toHaveTextContent("S1");
  });
  it("does not select a stale match while the next query is waiting to filter", () => {
    const change = vi.fn();
    render(<SiteCombobox sites={sites} value={null} onChange={change} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "S2" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(change).not.toHaveBeenCalled();
  });
  it("searches all 5,000 records while keeping the mounted result count bounded", async () => {
    render(<SiteCombobox sites={createSiteCatalogue(5000)} value={null} onChange={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    expect(screen.getAllByRole("option").length).toBeLessThan(30);
    fireEvent.change(input, { target: { value: "S6000" } });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("option")).toHaveTextContent("S6000");
  });
});
describe("selected review", () => {
  it("searches selected context independently and removes the right duplicate", async () => {
    function Review() {
      const [items, setItems] = useState(sites.map((site) => ({ ...site, meta: site.region + " › " + site.area })));
      return <><input aria-label="Main search" defaultValue="crown" /><SelectedReview compact items={items} noun="sites"
        onRemove={(id) => setItems((previous) => previous.filter((item) => item.id !== id))} /></>;
    }
    render(<Review />);
    fireEvent.click(screen.getByRole("button", { name: /Review selected/ }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "London" } });
    const list = screen.getByRole("list", { name: "Selected sites" });
    expect(within(list).queryByText("North › Leeds")).not.toBeInTheDocument();
    fireEvent.click(within(list).getByRole("button", { name: "Remove The Crown (S2)" }));
    await waitFor(() => expect(screen.getByRole("searchbox")).toHaveFocus());
    expect(screen.getByLabelText("Main search")).toHaveValue("crown");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    expect(screen.getByRole("button", { name: "Remove The Crown (S1)" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove The Crown (S2)" })).not.toBeInTheDocument();
  });
});
describe("large tree matching scope", () => {
  it("keeps all descendants for a parent match and only the exact leaf for its ID", () => {
    const catalogue = createSiteCatalogue(5000);
    const tree = createSiteTree(catalogue);
    expect(leaves(tree)).toHaveLength(5000);
    expect(leaves(filterTree(tree, "Yorkshire"))).toHaveLength(catalogue.filter((site) => site.region === "Yorkshire").length);
    expect(leaves(filterTree(tree, "S6000")).map((site) => site.id)).toEqual(["S6000"]);
  });
  it("shows full parent state while a filtered parent action affects only matching descendants", async () => {
    function Tree() {
      const [selected, setSelected] = useState(new Set(["S1"]));
      return <TreeChecklist tree={[{ id: "north", name: "North", children: sites.map((site) => ({ ...site, code: site.id })) }]} selected={selected} onChange={setSelected} searchLabel="Find site" noun="sites" />;
    }
    render(<Tree />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "S2" } });
    await waitFor(() => expect(screen.getAllByRole("treeitem")).toHaveLength(2));
    expect(screen.getAllByRole("treeitem")[0]).toHaveAttribute("aria-checked", "mixed");
    fireEvent.click(screen.getAllByRole("treeitem")[0]!);
    expect(screen.getByText("2 of 2 selected")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("treeitem")[0]!);
    expect(screen.getByText("1 of 2 selected")).toBeInTheDocument();
  });
});
