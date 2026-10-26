import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import { SelectionHistoryProvider, SelectionUndo } from "@/components/selectors/SelectionHistory";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href={import.meta.env.BASE_URL}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: `${import.meta.env.BASE_URL}favicon.svg`, type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:wght@400;500&family=Open+Sans:wght@400;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <SelectionHistoryProvider><AppShell /></SelectionHistoryProvider>
    </QueryClientProvider>
  );
}

const nav = [
  { to: "/", label: "Overview" },
  { to: "/sites-report", label: "A · Report sites" },
  { to: "/discounted-products", label: "A · Products" },
  { to: "/menu-push", label: "B · Menu push" },
  { to: "/navigation-rail", label: "C · Rails" },
  { to: "/checklists", label: "C · Checklists" },
  { to: "/transfer", label: "D · Dual list" },
  { to: "/multi-pane", label: "Multi-pane" },
] as const;

function AppShell() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="grid size-16 place-items-center rounded-full bg-header text-sm font-bold text-header-foreground">tevalis</div>
          <p className="font-display text-2xl text-header">Searchable selectors · prototype</p>
        </div>
        <nav className="bg-header">
          <div className="mx-auto flex max-w-6xl flex-wrap px-4">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
                className="px-3 py-3 font-display text-sm text-header-foreground/80 hover:text-header-foreground data-[status=active]:bg-action data-[status=active]:text-header-foreground">
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6"><SelectionUndo /><Outlet /></main>
      <footer className="mx-auto max-w-6xl border-t border-dashed border-border px-4 py-6 text-xs text-muted-foreground">Prototype with made-up data. Selections stay in this session. Reports and menu pushes are simulated.</footer>
    </div>
  );
}
