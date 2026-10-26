import { useSelectionState } from "@/components/selectors/SelectionHistory";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TreeChecklist } from "@/components/selectors/TreeChecklist";
import { PageTitle, Panel, Scenarios } from "@/components/selectors/Panel";
import { productTree } from "@/lib/data";

export const Route = createFileRoute("/discounted-products")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Discounted products – Tevalis prototype" },
      { name: "description", content: "Searchable product group and product tree for choosing which products a discount applies to." },
      { property: "og:title", content: "Discounted products – Tevalis prototype" },
      { property: "og:description", content: "Search products by name or stock code and keep ticks." },
    ],
  }),
  component: Page,
});

function Page() {
  const [sel, setSel] = useSelectionState<Set<string>>("discounted-products:selection", new Set(), "discounted products selection");
  return (
    <>
      <PageTitle crumb="Centralised Management › Discounts" title="Discounted Products" intro="Pattern A again: product group › product, searchable by name or stock code." />
      <div className="max-w-xl">
        <Panel title="Discounted Products – Staff 50% (D301)">
          <TreeChecklist tree={productTree} selected={sel} onChange={setSel} searchLabel="Search products or stock codes" noun="products" />
        </Panel>
      </div>
      <Scenarios items={["Search “corona” — both the draught and bottled products appear under their groups.", "Search “SC2010” to find a product by stock code.", "Tick the whole Draught group, then search “guinness” and untick it: Draught shows as partly ticked."]} />
    </>
  );
}
