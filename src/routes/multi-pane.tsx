import { useSelectionState } from "@/components/selectors/SelectionHistory";
import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { PageTitle, Panel, Scenarios } from "@/components/selectors/Panel";
import { Highlight, SearchBox, useDebounced } from "@/components/selectors/SearchBox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { companyGroups, measures, productGroups, products } from "@/lib/data";
import { priceMatches, textMatches } from "@/lib/selection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/multi-pane")({
  head: () => ({ meta: [
    { title: "Company Product Groups – Tevalis prototype" },
    { name: "description", content: "Company Group selection, Product Groups and independent Product Types, Products and Measures tabs." },
    { property: "og:title", content: "Company Product Groups – Tevalis prototype" },
    { property: "og:description", content: "Filter company groups, product groups and tab details without losing context." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Page,
});

const tabs = ["Product Types", "Products", "Measures"] as const;
type Tab = typeof tabs[number];

function PickList({ label, items, value, onChange }: { label: string; items: { id: string; name: string }[]; value: string; onChange: (value: string) => void }) {
  const id = useId();
  const [raw, setRaw] = useState("");
  const [active, setActive] = useState(0);
  const q = useDebounced(raw);
  const list = items.filter((x) => textMatches(q, x.name, x.id));
  return <>
    <SearchBox label={label} value={raw} onChange={(v) => { setRaw(v); setActive(0); }} query={q} shown={list.length} total={items.length} controls={`${id}-list`} activeDescendant={list[active] ? `${id}-option-${active}` : undefined} onKeyDown={(e) => {
      if (e.key === "Escape") setRaw("");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, Math.min(list.length - 1, a + (e.key === "ArrowDown" ? 1 : -1)))); }
      if (e.key === "Enter") { const item = list.length === 1 ? list[0] : list[active]; if (item) onChange(item.id); }
    }} />
    {!list.some((x) => x.id === value) && <p className="mt-2 bg-warn p-2 text-xs text-warn-foreground">Selected “{items.find((x) => x.id === value)?.name ?? value}” is hidden by this search.</p>}
    <ul id={`${id}-list`} role="listbox" aria-label={label.replace("Search", "Select")} className="mt-2 max-h-48 overflow-auto text-sm">
      {list.map((item, i) => <li id={`${id}-option-${i}`} key={item.id} role="option" aria-selected={value === item.id}>
        <Button type="button" variant="ghost" className={cn("h-auto min-h-8 w-full justify-start rounded-none border-l-4 px-2 py-1.5 text-left whitespace-normal", value === item.id ? "border-action bg-active font-semibold" : "border-transparent")} onFocus={() => setActive(i)} onClick={() => onChange(item.id)} onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const next = Math.max(0, Math.min(list.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))); setActive(next); document.getElementById(`${id}-option-${next}`)?.querySelector<HTMLButtonElement>("button")?.focus(); }
        }}><span className="min-w-0 flex-1 break-words"><Highlight text={item.name} q={q} /></span>{item.id !== item.name && <span className="font-mono text-xs text-muted-foreground"><Highlight text={item.id} q={q} /></span>}</Button>
      </li>)}
    </ul>
  </>;
}

function Page() {
  const [company, setCompany] = useSelectionState("multi-pane:company", "CG11", "company selection");
  const [group, setGroup] = useSelectionState("multi-pane:group", "Draught", "group selection");
  const [tab, setTab] = useState<Tab>("Products");
  const [pageRaw, setPageRaw] = useState("");
  const pageQ = useDebounced(pageRaw);
  const [queries, setQueries] = useState<Record<Tab, string>>({ "Product Types": "", Products: "", Measures: "" });
  const localQ = useDebounced(queries[tab]);
  const [measure, setMeasure] = useSelectionState("multi-pane:measure", "Pint", "measure selection");
  const [product, setProduct] = useSelectionState<string | null>("multi-pane:product", null, "product selection");
  const [active, setActive] = useState(0);
  const inGroup = products.filter((p) => p.group === group);
  // Prototype companies share the same catalogue: no invented company-level restriction.
  const groupMeasures = group === "Draught" ? measures.slice(0, 3) : group === "Bottles" ? ["Bottle"] : group === "Spirits" ? ["Single", "Double"] : ["Regular", "Large"];
  const allDetails = tab === "Products" ? inGroup.map((p) => ({ id: p.id, name: p.name, code: p.code, price: p.price })) : (tab === "Measures" ? groupMeasures : [group]).map((name) => ({ id: name, name, code: "", price: undefined }));
  const match = (q: string, row: typeof allDetails[number]) => textMatches(q, row.name, row.code, row.id, group, companyGroups.find((c) => c.id === company)?.name, company) || (row.price !== undefined && priceMatches(q, { ...row, price: row.price }));
  const pageDetails = allDetails.filter((row) => match(pageQ, row));
  const rows = pageDetails.filter((row) => row.price !== undefined ? priceMatches(localQ, { ...row, price: row.price }) : textMatches(localQ, row.name, row.id));
  const selectedId = tab === "Measures" ? measure : tab === "Products" ? product : group;
  const pick = (id: string) => { if (tab === "Measures") setMeasure(id); else if (tab === "Products") setProduct(id); };
  return <>
    <PageTitle crumb="Centralised Management › Company Product Groups" title="Company Product Groups" intro="" />
    <div className="mb-3 grid gap-3 md:grid-cols-[220px_1fr]">
      <div><h2 className="mb-2 text-base text-header">Company Group</h2><PickList label="Search company groups" items={companyGroups} value={company} onChange={setCompany} /></div>
      <div><h2 className="mb-2 text-base text-header">{companyGroups.find((c) => c.id === company)?.name} · {company}</h2><SearchBox label="Search page details" value={pageRaw} onChange={(v) => { setPageRaw(v); setActive(0); }} query={pageQ} shown={pageDetails.length} total={allDetails.length} controls="details-grid" onKeyDown={(e) => e.key === "Escape" && setPageRaw("")} /></div>
    </div>
    <div className="grid gap-3 md:grid-cols-[220px_1fr]">
      <Panel title="Product Groups"><PickList label="Search groups" items={productGroups.map((g) => ({ id: g, name: g }))} value={group} onChange={(g) => { setGroup(g); setActive(0); }} /></Panel>
      <Panel title={`Details – ${group}`}>
        <Tabs value={tab} onValueChange={(v) => { if (tabs.includes(v as Tab)) { setTab(v as Tab); setActive(0); } }}>
          <TabsList className="mb-3 flex h-auto flex-wrap justify-start" aria-label="Product group details">{tabs.map((t) => <TabsTrigger value={t} key={t}>{t}</TabsTrigger>)}</TabsList>
          {tabs.map((t) => <TabsContent value={t} key={t}>
            <SearchBox label={`Search ${t.toLowerCase()} in ${group}`} value={queries[t]} onChange={(v) => { setQueries((qs) => ({ ...qs, [t]: v })); setActive(0); }} query={localQ} shown={rows.length} total={pageDetails.length} controls="details-grid" activeDescendant={rows[active] ? `detail-${active}` : undefined} onKeyDown={(e) => {
              if (e.key === "Escape") setQueries((qs) => ({ ...qs, [t]: "" }));
              if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, Math.min(rows.length - 1, a + (e.key === "ArrowDown" ? 1 : -1)))); }
              if (e.key === "Enter") { const row = rows.length === 1 ? rows[0] : rows[active]; if (row) pick(row.id); }
            }} />
            <div className="mt-2 overflow-x-auto"><table id="details-grid" aria-label={`${t} in ${group}`} className="w-full text-sm">
              <thead className="bg-surface text-left"><tr><th className="p-1.5">Name</th>{t === "Products" && <><th className="p-1.5">Stock code</th><th className="p-1.5 text-right">Price</th></>}</tr></thead>
              <tbody>{rows.map((row, i) => <tr id={`detail-${i}`} key={row.id} aria-selected={selectedId === row.id} className={cn("border-t border-border", selectedId === row.id && "bg-active")}>
                <td className="p-1.5"><Button type="button" variant="ghost" className="h-auto w-full justify-start px-0 text-left whitespace-normal" onClick={() => pick(row.id)}><Highlight text={row.name} q={localQ || pageQ} /></Button></td>
                {t === "Products" && <><td className="p-1.5 font-mono text-xs"><Highlight text={row.code} q={localQ || pageQ} /></td><td className="p-1.5 text-right"><Highlight text={`£${row.price?.toFixed(2)}`} q={localQ || pageQ} /></td></>}
              </tr>)}</tbody>
            </table></div>
            {!rows.length && <div className="mt-3 bg-warn p-2 text-sm text-warn-foreground" role="status">
              {!allDetails.length ? `No ${t.toLowerCase()} in ${group}.` : !pageDetails.length ? <>No {t.toLowerCase()} in <strong>{group}</strong> match page search “{pageQ.trim()}”. <Button variant="link" size="sm" onClick={() => setPageRaw("")}>Clear page search</Button></> : <>No {t.toLowerCase()} in <strong>{group}</strong> match “{localQ.trim()}”. <Button variant="link" size="sm" onClick={() => setQueries((qs) => ({ ...qs, [t]: "" }))}>Clear {t.toLowerCase()} search</Button></>}
            </div>}
          </TabsContent>)}
        </Tabs>
      </Panel>
    </div>
    <Scenarios items={["Search groups for Spirits and press Enter; Details changes to Spirits.", "Search Products for £6.20, switch to Measures, then back: each tab keeps its own search.", "Filter page details, then clear only a tab search. The page search remains."]} />
  </>;
}
