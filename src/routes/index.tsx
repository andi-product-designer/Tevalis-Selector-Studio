import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle, Panel } from "@/components/selectors/Panel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Tevalis searchable selectors – prototype" },
      { name: "description", content: "Clickable prototype of searchable tree, single-select, rail, checklist and dual-list selectors for Tevalis." },
      { property: "og:title", content: "Tevalis searchable selectors – prototype" },
      { property: "og:description", content: "Find, select and act on records across Tevalis back-office apps." },
    ],
  }),
  component: Index,
});

const patterns = [
  { to: "/sites-report", tag: "A · Priority 1", title: "Select sites for a report", app: "Business Analytics" },
  { to: "/menu-push", tag: "B · Priority 1", title: "Choose site for a menu push", app: "EPOS Designer 2017" },
  { to: "/navigation-rail", tag: "C · Priority 2", title: "Navigation rails", app: "CM Discounts, Promotions, Company Groups" },
  { to: "/checklists", tag: "C · Priority 2", title: "Checklist dropdowns", app: "CM Runs At Sites, Price Groups" },
  { to: "/discounted-products", tag: "A · Priority 2", title: "Discounted products tree", app: "CM Discounts" },
  { to: "/transfer", tag: "D · Priority 3", title: "Available / In Use lists", app: "CM Manager Functions" },
  { to: "/multi-pane", tag: "Priority 3", title: "Product groups multi-pane", app: "CM Company Product Groups" },
] as const;

const rules = [
  "Search is always shown above its list, matching name or ID, any case, with highlighted matches.",
  "“n of N” under every box; “No matches for …” differs from an empty list.",
  "Searching or clearing never changes what is ticked or which record is open.",
  "↑ ↓ move, Enter picks, Esc clears the search then closes.",
  "Bulk actions state exactly how many items they affect.",
];

function Index() {
  return (
    <>
      <PageTitle crumb="Prototype" title="Searchable selectors" intro="One consistent way to find, select and act on records across Business Analytics, Centralised Management and EPOS Designer." />
      <div className="grid gap-3 md:grid-cols-2">
        {patterns.map((p) => (
          <Link key={p.to} to={p.to} className="group border border-border bg-card p-4 hover:border-action">
            <p className="text-xs font-semibold uppercase text-action">{p.tag}</p>
            <h2 className="mt-1 text-xl text-header group-hover:underline">{p.title}</h2>
            <p className="text-sm text-muted-foreground">{p.app}</p>
          </Link>
        ))}
      </div>
      <Panel title="Shared rules" className="mt-6">
        <ul className="list-disc space-y-1 pl-5 text-sm">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
      </Panel>
    </>
  );
}
