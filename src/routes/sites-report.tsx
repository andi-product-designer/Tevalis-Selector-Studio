import { useSelectionState } from "@/components/selectors/SelectionHistory";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { selectedIdentity } from "@/lib/selection";
import { ChevronDown } from "lucide-react";
import { TreeChecklist } from "@/components/selectors/TreeChecklist";
import { ActionButton, PageTitle, Panel, Scenarios } from "@/components/selectors/Panel";
import { siteTree, sites } from "@/lib/data";

export const Route = createFileRoute("/sites-report")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Select sites for a report – Tevalis prototype" },
      { name: "description", content: "Searchable Region > Area > Site checklist for generating Business Analytics reports." },
      { property: "og:title", content: "Select sites for a report – Tevalis prototype" },
      { property: "og:description", content: "Search and tick sites without losing earlier ticks." },
    ],
  }),
  component: Page,
});

function Page() {
  const [sel, setSel] = useSelectionState<Set<string>>("sites-report:selection", new Set(), "sites report selection");
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const names = sites.filter((s) => sel.has(s.id)).map(selectedIdentity);
  return (
    <>
      <PageTitle crumb="Reports › Sales Reports" title="Generate A Report" intro="Pattern A: tree checklist. Ticks are kept while you search, and Check all only affects what is shown." />
      <Panel>
        <label className="block text-sm">Report</label>
        <div className="mb-4 h-9 border border-input px-2 text-sm leading-9">Best / Bottom Sellers By Prod Type Top 10</div>
        <label className="block text-sm" id="sites-label">Select Sites</label>
        <div className="relative">
          <Button ref={trigger} variant="outline" type="button" aria-labelledby="sites-label" aria-controls="sites-picker" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-full items-center justify-between border border-input px-2 text-left text-sm">
            <span className={sel.size ? "" : "italic"}>
              {sel.size === 0 ? "No sites selected" : sel.size <= 2 ? names.join(", ") : `${sel.size} sites selected`}
            </span>
            <ChevronDown className="size-4" />
          </Button>
          {open && (
            <div id="sites-picker" role="dialog" aria-label="Select report sites" className="absolute z-10 mt-0.5 w-full border border-border bg-popover p-3 shadow-lg">
              <TreeChecklist tree={siteTree} selected={sel} onChange={(next) => { setSel(next); setDone(null); }} searchLabel="Search sites by name or ID" noun="sites" autoFocus onClose={close} />
              <div className="mt-2 text-right"><Button variant="link" className="text-sm text-action" onClick={close}>Done · {sel.size} sites selected</Button></div>
            </div>
          )}
        </div>
        <div className="mt-6">
          <ActionButton disabled={!sel.size} onClick={() => setDone(`Report generated for ${sel.size} site${sel.size === 1 ? "" : "s"}.`)}>Generate report</ActionButton>
          {done && <p className="mt-2 text-sm" role="status">{done}</p>}
        </div>
      </Panel>
      <Scenarios items={[
        "Tick one site, search for a site in another region, tick it, then clear the search. Both stay ticked.",
        "Search “guys” inside Yorkshire, then use Check all — it says exactly how many shown sites it will tick.",
        "Search a site ID such as S1150 and press Enter to tick the single match.",
      ]} />
    </>
  );
}
