import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectedIdentity } from "@/lib/selection";

type Item = { id: string; name: string; code?: string | undefined };

export function SelectedReview({ items, noun, onRemove, compact = false }: {
  items: Item[]; noun: string; onRemove: (id: string) => void; compact?: boolean;
}) {
  const [review, setReview] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const remove = (itemId: string) => {
    const buttons = root.current?.querySelectorAll<HTMLButtonElement>('button[aria-label^="Remove "]');
    const index = items.findIndex((item) => item.id === itemId);
    const next = buttons?.[index + 1] ?? buttons?.[index - 1];
    const container = root.current?.parentElement;
    onRemove(itemId);
    requestAnimationFrame(() => {
      if (next?.isConnected) next.focus();
      else container?.querySelector<HTMLElement>('input[type="search"], button[aria-haspopup], button')?.focus();
    });
  };
  if (!items.length) return null;
  const display = review || (!compact && items.length <= 5);
  return <div ref={root} className="mt-2 text-xs">
    <Button type="button" variant="link" size="sm" className="h-auto px-0 text-action" aria-expanded={review} aria-controls={id} onClick={() => setReview((v) => !v)}>
      {review ? "Hide selected" : "Review selected"} · {items.length} {noun}
    </Button>
    {display && <ul id={id} aria-label={`Selected ${noun}`} className={review ? "mt-2 max-h-48 overflow-auto divide-y divide-border" : "mt-2 flex flex-wrap gap-1"}>
      {items.map((item) => <li key={item.id} className="flex items-center gap-2 bg-active px-2 py-1">
        <span className="min-w-0 flex-1 break-words">{item.name} <span className="font-mono text-muted-foreground">({item.code ?? item.id})</span></span>
        <Button type="button" variant="ghost" size="icon" className="size-6 shrink-0" aria-label={`Remove ${selectedIdentity({ ...item, id: item.code ?? item.id })}`} title={`Remove ${item.code ?? item.id}`} onClick={() => remove(item.id)}><X /></Button>
      </li>)}
    </ul>}
  </div>;
}