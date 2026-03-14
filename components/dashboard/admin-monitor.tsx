import { Shield, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MemberProfile } from "@/lib/bank-data";
import type { AdminEvent, Transaction } from "@/lib/demo-bank-data";
import type { AppSession } from "@/lib/session";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";

type AdminMonitorProps = {
  adminEvents: AdminEvent[];
  profiles: MemberProfile[];
  session: AppSession;
  summary: {
    highSeverityCount: number;
    securityEventCount: number;
    transferEventCount: number;
    paymentEventCount: number;
    systemEventCount: number;
  };
  transactions: Transaction[];
};

export function AdminMonitor({ adminEvents, profiles, session, summary, transactions }: AdminMonitorProps) {
  const prioritizedEvents = [...adminEvents].sort((left, right) => {
    if (left.severity !== right.severity) {
      return left.severity === "high" ? -1 : 1;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#112134_0%,#1f3550_65%,#f56f48_180%)] p-8 text-white shadow-panel">
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/55">Admin panel</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Operations monitor</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72">
              Review customer access, monitor transaction activity, and track account alerts across the platform.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Role</p>
              <p className="mt-2 font-semibold text-white">{session.role}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Users</p>
              <p className="mt-2 font-semibold text-white">{profiles.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Alerts</p>
              <p className="mt-2 font-semibold text-white">{adminEvents.length}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-4">
        <Card>
          <Users className="h-5 w-5 text-surge" />
          <p className="mt-4 text-sm text-muted">Managed users</p>
          <p className="mt-2 text-2xl font-semibold">{profiles.length}</p>
          <p className="mt-1 text-sm text-muted">Active customer and operations profiles in the current environment</p>
        </Card>
        <Card>
          <Shield className="h-5 w-5 text-ember" />
          <p className="mt-4 text-sm text-muted">Flagged events</p>
          <p className="mt-2 text-2xl font-semibold">{summary.highSeverityCount}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Security</p>
          <p className="mt-3 text-2xl font-semibold">{summary.securityEventCount}</p>
          <p className="mt-1 text-sm text-muted">Security-linked alerts currently visible in the admin feed</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Payments</p>
          <p className="mt-3 text-2xl font-semibold">{summary.paymentEventCount}</p>
          <p className="mt-1 text-sm text-muted">Bill-pay events and related money-movement alerts</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Last transaction</p>
          <p className="mt-3 text-2xl font-semibold">{formatCurrency(transactions[0]?.amountCents ?? 0)}</p>
          <p className="mt-1 text-sm text-muted">{transactions[0]?.description ?? "No transactions yet"}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Activity</p>
          <p className="mt-3 text-2xl font-semibold">{transactions.length}</p>
          <p className="mt-1 text-sm text-muted">Ledger rows visible to the current admin session</p>
        </Card>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Security posture</p>
          <h2 className="mt-2 text-2xl font-semibold">Alert breakdown</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[22px] border border-line/70 bg-slate-50/95 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Transfers</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.transferEventCount}</p>
            </div>
            <div className="rounded-[22px] border border-line/70 bg-slate-50/95 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Payments</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.paymentEventCount}</p>
            </div>
            <div className="rounded-[22px] border border-line/70 bg-slate-50/95 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">System</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.systemEventCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Prioritized alerts</p>
          <h2 className="mt-2 text-2xl font-semibold">Triage queue</h2>
          <div className="mt-5 space-y-3">
            {prioritizedEvents.slice(0, 4).map((event) => (
              <div key={event.id} className="rounded-[22px] border border-line/70 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold capitalize text-ink">{event.label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{event.detail}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="border-line bg-white text-ink">{event.kind}</Badge>
                    <p className={event.severity === "high" ? "mt-2 text-xs uppercase tracking-[0.18em] text-ember" : "mt-2 text-xs uppercase tracking-[0.18em] text-surge"}>
                      {event.severity}
                    </p>
                    <p className="mt-1 text-xs text-muted">{formatRelativeDate(event.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.15fr]">
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Users</p>
          <h2 className="mt-2 text-2xl font-semibold">Identity registry</h2>
          <div className="mt-5 space-y-3">
            {profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between rounded-[22px] border border-line/70 px-5 py-4">
                <div>
                  <p className="text-base font-semibold text-ink">{profile.fullName}</p>
                  <p className="mt-1 text-sm text-muted">{profile.email}</p>
                </div>
                <div className="text-right">
                  <Badge className={profile.role === "admin" ? "border-ember/20 bg-ember/10 text-ember" : ""}>
                    {profile.role}
                  </Badge>
                  <p className="mt-2 text-xs text-muted">{formatRelativeDate(profile.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Transactions</p>
          <h2 className="mt-2 text-2xl font-semibold">Cross-user activity feed</h2>
          <div className="mt-5 space-y-3">
            {transactions.slice(0, 6).map((transaction) => (
              <div key={transaction.id} className="grid gap-3 rounded-[22px] border border-line/70 px-5 py-4 lg:grid-cols-[minmax(0,1.3fr)_0.55fr_0.55fr]">
                <div>
                  <p className="text-base font-semibold text-ink">{transaction.description}</p>
                  <p className="mt-1 text-sm text-muted">{transaction.merchantName}</p>
                </div>
                <div className="flex items-center lg:justify-center">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                    {transaction.category}
                  </span>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-sm font-semibold text-ink">{formatCurrency(transaction.amountCents)}</p>
                  <p className="mt-1 text-xs text-muted">{formatRelativeDate(transaction.occurredAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      <Card>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Alert stream</p>
        <h2 className="mt-2 text-2xl font-semibold">Monitoring feed</h2>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {adminEvents.map((event) => (
            <div key={event.id} className="rounded-[22px] border border-line/70 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold capitalize text-ink">{event.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{event.detail}</p>
                </div>
                <div className="text-right">
                  <p className={event.severity === "high" ? "text-xs uppercase tracking-[0.18em] text-ember" : "text-xs uppercase tracking-[0.18em] text-surge"}>
                    {event.severity}
                  </p>
                  <p className="mt-1 text-xs text-muted">{formatRelativeDate(event.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
