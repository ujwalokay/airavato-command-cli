import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Building2,
  CircleHelp,
  FileClock,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MonitorSmartphone,
  Moon,
  Package,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/head/status-badge";
import { useSession } from "@/components/head/session";
import { ROLES, relTime } from "@/lib/head-data";
import { useIncidents } from "@/lib/head-db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/cafes", label: "Cafes", icon: Building2 },
  { to: "/installations", label: "Installations", icon: MonitorSmartphone },
  { to: "/licenses", label: "Licenses", icon: ShieldCheck },
  { to: "/health", label: "Health Monitor", icon: Activity },
  { to: "/sync", label: "Sync Center", icon: RefreshCcw },
  { to: "/releases", label: "Software Releases", icon: Package },
  { to: "/diagnostics", label: "Support Diagnostics", icon: LifeBuoy },
  { to: "/audit", label: "Audit Logs", icon: FileClock },
  { to: "/settings", label: "Platform Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-0.5 p-2">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 border-b px-4 py-3.5">
      <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <ShieldCheck className="size-4" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight">AiravotoHead</span>
        <span className="block text-[11px] text-muted-foreground">Operations control plane</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const [drawer, setDrawer] = useState(false);
  const { data: incidents, isLoading: incidentsLoading } = useIncidents();
  const open = incidents.filter((i) => i.status !== "Resolved").slice(0, 6);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <Brand />
        <ScrollArea className="flex-1">
          <NavList />
        </ScrollArea>
        <div className="border-t p-3 text-[11px] text-muted-foreground">
          Local-first POS control plane · v1.0 pilot
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur sm:px-5">
          <Sheet open={drawer} onOpenChange={setDrawer}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <NavList onNavigate={() => setDrawer(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cafes, installations, event IDs…"
              aria-label="Global search"
              className="h-9 pl-8"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell className="size-4" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-88 p-0">
                <div className="border-b px-3 py-2 text-sm font-medium">
                  Notifications · grouped by cafe
                </div>
                {incidentsLoading ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Loading notifications…
                  </div>
                ) : open.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    No open incidents right now.
                  </div>
                ) : (
                  <ul className="max-h-80 divide-y overflow-y-auto">
                    {open.map((i) => (
                      <li key={i.id} className="space-y-1 px-3 py-2.5 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{i.kind}</span>
                          <StatusBadge status={i.severity} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {i.cafeName} · {relTime(i.openedAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                  Duplicate alerts within 6 hours are collapsed to avoid alert fatigue.
                </div>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Help and documentation"
                  onClick={() => toast.info("Operations handbook opens in the docs workspace.")}
                >
                  <CircleHelp className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help & documentation</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle theme"
                  onClick={session.toggleTheme}
                >
                  {session.theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Switch theme</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                    {session.name.slice(0, 1)}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-xs font-medium">{session.name}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {session.roleLabel}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Active role (demo switcher)</DropdownMenuLabel>
                {ROLES.map((r) => (
                  <DropdownMenuItem
                    key={r.id}
                    onSelect={() => session.setRole(r.id)}
                    className="flex-col items-start gap-0.5"
                  >
                    <span className={cn("text-sm", session.role === r.id && "font-semibold text-primary")}>
                      {r.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{r.blurb}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => toast.success("Session ended securely.")}>
                  <LogOut className="size-4" /> Secure logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
