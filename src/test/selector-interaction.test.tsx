import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { TreeChecklist } from "@/components/selectors/TreeChecklist";
import { SearchBox } from "@/components/selectors/SearchBox";
import { SelectedReview } from "@/components/selectors/SelectedReview";

afterEach(cleanup);

describe("selector keyboard rules", () => {
  it("removing the final selected site returns focus to its selector", async () => {
    function Harness() {
      const [items, setItems] = useState([{ id: "S1001", name: "The Crown" }]);
      return <div><button aria-haspopup="dialog">Select sites</button><SelectedReview items={items} noun="sites" onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))} /></div>;
    }
    render(<Harness />);
    const remove = screen.getByRole("button", { name: "Remove The Crown (S1001)" });
    remove.focus(); fireEvent.click(remove);
    await waitFor(() => expect(screen.getByRole("button", { name: "Select sites" })).toHaveFocus());
  });

  it("clear search returns focus to the search input", () => {
    function Harness() {
      const [value, setValue] = useState("guinness");
      return <SearchBox label="Find products" value={value} onChange={setValue} query={value} shown={1} total={8} />;
    }
    render(<Harness />);
    const clear = screen.getByRole("button", { name: "Clear search" });
    clear.focus(); fireEvent.click(clear);
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("Enter toggles only the matching Guinness product, leaving seven selected", async () => {
    function Harness() {
      const [selected, setSelected] = useState(new Set(Array.from({ length: 8 }, (_, i) => `p${i}`)));
      return <TreeChecklist tree={[{ id: "draught", name: "Draught", children: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, name: i === 0 ? "Guinness" : `Beer ${i}` })) }]} selected={selected} onChange={setSelected} searchLabel="Find products" noun="products" />;
    }
    render(<Harness />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "guinness" } });
    await waitFor(() => expect(screen.getAllByRole("treeitem")).toHaveLength(2));
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getAllByRole("treeitem")[0]).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByText("7 of 8 selected")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(screen.getAllByRole("treeitem")).toHaveLength(9));
    expect(screen.getByText("7 of 8 selected")).toBeInTheDocument();
  });
});