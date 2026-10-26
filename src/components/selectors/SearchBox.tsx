import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function useDebounced<T>(value: T, ms = 150) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function Highlight({ text, q }: { text: string; q: string }) {
  const s = q.trim();
  if (!s) return <span>{text}</span>;
  const i = text.toLowerCase().indexOf(s.toLowerCase());
  if (i < 0) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, i)}
      <mark className="bg-mark text-foreground rounded-sm">{text.slice(i, i + s.length)}</mark>
      {text.slice(i + s.length)}
    </span>
  );
}

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  shown: number;
  total: number;
  query: string;
  onKeyDown?: ((e: KeyboardEvent<HTMLInputElement>) => void) | undefined;
  autoFocus?: boolean | undefined;
  inputRef?: RefObject<HTMLInputElement | null> | undefined;
  controls?: string | undefined;
  activeDescendant?: string | undefined;
};

export function SearchBox({ label, value, onChange, shown, total, query, onKeyDown, autoFocus, inputRef, controls, activeDescendant }: Props) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;
  useEffect(() => {
    if (activeDescendant) document.getElementById(activeDescendant)?.scrollIntoView({ block: "nearest" });
  }, [activeDescendant]);
  return (
    <div className="w-full shrink-0">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          ref={ref}
          type="search"
          aria-label={label}
          aria-controls={controls}
          aria-activedescendant={activeDescendant}
          placeholder={label}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
            onKeyDown?.(e);
          }}
          className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-8 text-sm outline-none focus:border-action focus:ring-2 focus:ring-action/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <Button variant="ghost" size="icon"
            type="button"
            aria-label="Clear search"
            onClick={() => { onChange(""); ref.current?.focus(); }}
            className="absolute right-1 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
        {total === 0
          ? "This list is empty"
          : query.trim() && shown === 0
            ? <>No matches for “{query.trim()}”</>
            : `${shown} of ${total}`}
      </p>
    </div>
  );
}
