import { useSelectionState } from "@/components/selectors/SelectionHistory";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageTitle, Panel, Scenarios } from "@/components/selectors/Panel";
import type { Site } from "@/lib/data";
import { SiteCombobox } from "@/components/selectors/SiteCombobox";
import { useSiteCatalogue } from "@/lib/site-catalogue";

export const Route = createFileRoute("/menu-push")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Choose a site for a menu push – Tevalis prototype" },
      { name: "description", content: "Searchable single-site picker with a separate confirm step before pushing menus." },
      { property: "og:title", content: "Choose a site for a menu push – Tevalis prototype" },
      { property: "og:description", content: "Tell look-alike sites apart and confirm before pushing." },
    ],
  }),
  component: Page,
});

function Page() {
  const { sites } = useSiteCatalogue();
  const pushTrigger = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const [dest, setDest] = useSelectionState<Site | null>("menu-push:destination", null, "menu destination selection");
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (confirm) confirmButton.current?.focus(); }, [confirm]);
  const closeConfirmation = () => { setConfirm(false); pushTrigger.current?.focus(); };
  const [pushed, setPushed] = useState<string | null>(null);

  useEffect(() => { setConfirm(false); setPushed(null); }, [dest]);

  return (
    <>
      <PageTitle crumb="EPOS Designer 2017 › Site Menus" title="Select a site" intro="Pattern B: single select. Picking a site only sets the destination — pushing is a separate, confirmed step. Enter never pushes." />
      <div className="max-w-2xl">
        <Panel title="Push menu: Autumn Food 2026">
          <SiteCombobox sites={sites} value={dest} onChange={(site) => { setConfirm(false); setDest(site); setPushed(null); }} />
          <div className="mt-6 flex items-center gap-3">
            <Button ref={pushTrigger} disabled={!dest} className="bg-action text-action-foreground" onClick={() => setConfirm(true)}>Push menu…</Button>
            {pushed && <span className="text-sm" role="status">{pushed}</span>}
          </div>
          {confirm && dest && (
            <div role="region" aria-label="Confirm push" onKeyDown={(e) => { if (e.key === "Escape") closeConfirmation(); }} className="mt-4 border border-action bg-active p-3 text-sm">
              <p>Push <strong>Autumn Food 2026</strong> to <strong>{dest.name}</strong> ({dest.id}, {dest.region} › {dest.area})?</p>
              <div className="mt-3 flex gap-2">
                <Button ref={confirmButton} className="bg-action text-action-foreground" onClick={() => { closeConfirmation(); setPushed(`Pretend push sent to ${dest.name} (${dest.id}).`); }}>Confirm push</Button>
                <Button variant="link" className="px-3 text-sm underline" onClick={closeConfirmation}>Cancel</Button>
              </div>
            </div>
          )}
        </Panel>
      </div>
      <Scenarios items={["Search “crown – leeds” — several look-alike sites show their ID and area so you can pick the right one.", "Type a search then press Esc twice: the search clears, then the list closes, and the destination is unchanged.", "Pick a site with Enter — nothing is pushed until you confirm."]} />
    </>
  );
}
