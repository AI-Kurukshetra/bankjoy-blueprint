import { ArrowDownRight, ArrowUpRight, ShieldAlert, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Account, Notification, Transaction } from "@/lib/demo-bank-data";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";

type OverviewProps = {
  accounts: Account[];
  transactions: Transaction[];
  notifications: Notification[];
};

export function Overview({ accounts, transactions, notifications }: OverviewProps) {
  const totalBalanceCents = accounts.reduce((sum, account) => sum + account.balanceCents, 0);
  const credits = transactions.filter((item) => item.direction === "credit").length;
  const debits = transactions.filter((item) => item.direction === "debit").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#112134_0%,#1e3854_65%,#00a6a6_145%)] p-8 text-white shadow-panel xl:col-span-8">
          <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/60">Command center</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight xl:text-5xl">
                A clearer view of your money.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                Track balances, recent account activity, and security notifications from a workspace built for everyday banking.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Available balance</p>
                <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalBalanceCents)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Credits</p>
                <p className="mt-2 text-3xl font-semibold">{credits}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Debits</p>
                <p className="mt-2 text-3xl font-semibold">{debits}</p>
              </div>
            </div>
          </div>
        </div>
        <Card className="xl:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Security</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Alerts pulse</h2>
            </div>
            <ShieldAlert className="h-5 w-5 text-ember" />
          </div>
          <div className="mt-5 space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="rounded-[22px] border border-line/80 bg-slate-50/90 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{notification.title}</p>
                  <p className="text-xs text-muted">{formatRelativeDate(notification.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{notification.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        {accounts.map((account) => (
          <Card key={account.id} className="xl:col-span-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">{account.type}</p>
                <h2 className="mt-2 text-xl font-semibold">{account.name}</h2>
                <p className="mt-1 text-sm text-muted">{account.mask}</p>
              </div>
              <Wallet className="h-5 w-5 text-surge" />
            </div>
            <p className="mt-8 text-3xl font-semibold">{formatCurrency(account.balanceCents, account.currency)}</p>
          </Card>
        ))}
        <Card className="bg-ink text-white xl:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/55">Security</p>
              <h2 className="mt-2 text-xl font-semibold">Alerts pulse</h2>
            </div>
            <ShieldAlert className="h-5 w-5 text-ember" />
          </div>
          <div className="mt-6 space-y-3">
            {notifications.slice(0, 2).map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="mt-2 text-sm text-white/70">{notification.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Recent activity</p>
              <h2 className="mt-2 text-xl font-semibold">Latest transactions</h2>
            </div>
            <Badge>Live feed</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="grid gap-4 rounded-[24px] border border-line/70 px-5 py-4 lg:grid-cols-[minmax(0,1.4fr)_0.8fr_0.5fr]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={
                      transaction.direction === "credit"
                        ? "rounded-full bg-surge/10 p-2 text-surge"
                        : "rounded-full bg-ember/10 p-2 text-ember"
                    }
                  >
                    {transaction.direction === "credit" ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{transaction.description}</p>
                    <p className="truncate text-sm text-muted">{transaction.merchantName}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 lg:justify-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{transaction.category}</p>
                  <Badge className="border-line bg-white text-ink">{transaction.status}</Badge>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-sm font-semibold text-ink">
                    {transaction.direction === "credit" ? "+" : "-"}
                    {formatCurrency(transaction.amountCents)}
                  </p>
                  <p className="text-xs text-muted">{formatRelativeDate(transaction.occurredAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Operating snapshot</p>
          <h2 className="mt-2 text-xl font-semibold">Status summary</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-sm text-muted">Posted transactions</p>
              <p className="mt-2 text-2xl font-semibold">{transactions.filter((item) => item.status === "posted").length}</p>
            </div>
            <div className="rounded-2xl bg-dune p-4">
              <p className="text-sm text-muted">Pending items</p>
              <p className="mt-2 text-2xl font-semibold">{transactions.filter((item) => item.status === "pending").length}</p>
            </div>
            <div className="rounded-2xl bg-accent-soft p-4">
              <p className="text-sm text-muted">Notification count</p>
              <p className="mt-2 text-2xl font-semibold">{notifications.length}</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
