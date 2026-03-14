"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CreditCard, Landmark, LayoutDashboard, Receipt, RefreshCw, Shield, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/demo-bank-data";
import type { AppSession } from "@/lib/session";
import { cn, formatRelativeDate } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  notifications: Notification[];
  session: AppSession;
  logoutAction: () => Promise<void>;
};

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/transfers", label: "Transfers", icon: RefreshCw },
  { href: "/dashboard/payments", label: "Payments", icon: Receipt },
  { href: "/dashboard/security", label: "Security", icon: Shield },
  { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck },
];

export function AppShell({ children, notifications, session, logoutAction }: AppShellProps) {
  const pathname = usePathname();
  const visibleNavigation = navigation.filter((item) => item.href !== "/dashboard/admin" || session.role === "admin");

  return (
    <div className="app-grid min-h-screen">
      <div className="mx-auto grid min-h-screen w-full max-w-[1680px] gap-6 px-4 py-5 xl:grid-cols-[290px_minmax(0,1fr)_360px] xl:px-6 2xl:px-8">
        <aside className="rounded-[34px] border border-white/70 bg-ink p-6 text-white shadow-panel xl:sticky xl:top-5 xl:h-[calc(100vh-2.5rem)] xl:overflow-y-auto">
          <div className="flex h-full flex-col gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/55">Bankjoy</p>
              <h1 className="mt-3 text-2xl font-semibold">Digital banking</h1>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Manage accounts, transfers, and activity from one secure workspace.
              </p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/65">Signed in as</p>
                  <p className="mt-2 text-lg font-medium">{session.fullName}</p>
                  <p className="text-sm text-white/70">{session.email}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <Landmark className="h-5 w-5 text-white" />
                </div>
              </div>
              <Badge className="mt-4 border-white/10 bg-white/10 text-white">{session.role}</Badge>
            </div>
            <nav className="space-y-2">
              {visibleNavigation.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                    pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                      ? "bg-white text-ink"
                      : "text-white/78 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                        ? "bg-surge"
                        : "bg-transparent",
                    )}
                  />
                </Link>
              ))}
            </nav>
            <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-surge" />
                <p className="text-sm font-medium">Account snapshot</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/8 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Access</p>
                  <p className="mt-2 text-sm font-medium text-white">Secure</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Notifications</p>
                  <p className="mt-2 text-sm font-medium text-white">{notifications.length}</p>
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <form action={logoutAction}>
                <Button className="w-full bg-white text-ink hover:bg-white" type="submit" variant="primary">
                  Log out
                </Button>
              </form>
            </div>
          </div>
        </aside>
        <main className="space-y-6 py-1">
          <div className="rounded-[32px] border border-white/70 bg-white/72 px-6 py-5 shadow-panel backdrop-blur-sm">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.26em] text-muted">Workspace</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                  Your banking workspace
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Review balances, monitor account activity, and stay current with important account updates.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Role</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{session.role}</p>
                </div>
                <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Center</p>
                  <p className="mt-2 text-sm font-semibold text-ink">Operations</p>
                </div>
                <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Feed</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{notifications.length} signals</p>
                </div>
              </div>
            </div>
          </div>
          {children}
        </main>
        <aside className="space-y-5 xl:sticky xl:top-5 xl:h-fit">
          <div className="rounded-[30px] border border-white/70 bg-white/88 p-6 shadow-panel backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Activity center</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Notifications</h2>
              </div>
              <Bell className="h-5 w-5 text-surge" />
            </div>
            <div className="mt-5 space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="rounded-[22px] border border-line/80 bg-slate-50/95 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{notification.title}</p>
                    <span className="text-xs text-muted">{formatRelativeDate(notification.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{notification.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-ember/20 bg-gradient-to-br from-ember/10 via-white to-dune p-6 shadow-panel">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Service update</p>
            <h2 className="mt-2 text-xl font-semibold text-ink">Account support</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Transfer activity, account notifications, and account oversight are available from the same workspace.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
