import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function PageTitle({ crumb, title, intro }: { crumb: string; title: string; intro: ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-action">{crumb}</p>
      <h1 className="mt-1 text-3xl text-header">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{intro}</p>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-border bg-card ${className}`}>
      {title && <h2 className="bg-header px-3 py-2 text-base text-header-foreground">{title}</h2>}
      <div className="p-3">{children}</div>
    </section>
  );
}

export function Scenarios({ items }: { items: string[] }) {
  return (
    <aside className="mt-6 border-l-4 border-action bg-surface p-4 text-sm">
      <h3 className="mb-2 text-base text-header">Try these</h3>
      <ol className="list-decimal space-y-1 pl-5">{items.map((s) => <li key={s}>{s}</li>)}</ol>
    </aside>
  );
}

export function ActionButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button type="button" {...props} className={`h-9 bg-action px-5 text-sm font-semibold uppercase tracking-wide text-action-foreground hover:brightness-95 disabled:opacity-40 ${props.className ?? ""}`} />;
}
