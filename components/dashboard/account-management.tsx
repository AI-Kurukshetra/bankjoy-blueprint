"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Download, FileText, Landmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ManagedAccount } from "@/lib/bank-data";
import type { Transaction } from "@/lib/demo-bank-data";
import type { StatementRecord } from "@/lib/statements";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";

type AccountManagementProps = {
  accounts: ManagedAccount[];
  statements: StatementRecord[];
  transactions: Transaction[];
};

export function AccountManagement({ accounts, statements, transactions }: AccountManagementProps) {
  const totalBalanceCents = accounts.reduce((sum, account) => sum + account.balanceCents, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#112134_0%,#17314b_62%,#00a6a6_160%)] p-8 text-white shadow-panel xl:col-span-8">
          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/58">Accounts</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight xl:text-5xl">Account details and statements</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
                Review balances, track account-level activity, and download recent statements from one secure workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Accounts</p>
                <p className="mt-2 text-3xl font-semibold">{accounts.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Available balance</p>
                <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalBalanceCents)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Statements</p>
                <p className="mt-2 text-3xl font-semibold">{statements.length}</p>
              </div>
            </div>
          </div>
        </div>
        <Card className="xl:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Statement center</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Download-ready records</h2>
          <div className="mt-5 space-y-3">
            {statements.slice(0, 3).map((statement) => (
              <div key={statement.id} className="rounded-[22px] border border-line/80 bg-slate-50/95 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{statement.periodLabel}</p>
                    <p className="mt-1 text-sm text-muted">{statement.fileName}</p>
                  </div>
                  <Badge className="border-line bg-white text-ink">{statement.format}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">Generated {formatDate(statement.generatedAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6">
        {accounts.map((account) => {
          const accountTransactions = transactions.filter((transaction) => transaction.accountId === account.id).slice(0, 4);
          const accountStatements = statements.filter((statement) => statement.accountId === account.id);

          return (
            <Card key={account.id}>
              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <div className="space-y-6">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">{account.type}</p>
                          <h2 className="mt-2 text-2xl font-semibold text-ink">{account.name}</h2>
                          <p className="mt-1 text-sm text-muted">{account.mask}</p>
                        </div>
                        <div className="rounded-2xl bg-surge/10 p-3 text-surge">
                          <Landmark className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-6 text-4xl font-semibold text-ink">{formatCurrency(account.balanceCents, account.currency)}</p>
                      <p className="mt-2 text-sm text-muted">Opened {formatDate(account.createdAt)}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                      <div className="rounded-[24px] border border-line/70 bg-mist px-5 py-4">
                        <p className="text-sm text-muted">Posted credits</p>
                        <p className="mt-2 text-2xl font-semibold text-ink">{formatCurrency(account.monthlyCreditsCents)}</p>
                      </div>
                      <div className="rounded-[24px] border border-line/70 bg-dune px-5 py-4">
                        <p className="text-sm text-muted">Posted debits</p>
                        <p className="mt-2 text-2xl font-semibold text-ink">{formatCurrency(account.monthlyDebitsCents)}</p>
                      </div>
                      <div className="rounded-[24px] border border-line/70 bg-accent-soft px-5 py-4">
                        <p className="text-sm text-muted">Activity count</p>
                        <p className="mt-2 text-2xl font-semibold text-ink">{account.transactionCount}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Recent activity</p>
                        <h3 className="mt-2 text-lg font-semibold text-ink">Latest account transactions</h3>
                      </div>
                      {account.latestActivityAt ? (
                        <p className="text-sm text-muted">Last posted {formatRelativeDate(account.latestActivityAt)}</p>
                      ) : null}
                    </div>
                    <div className="mt-4 space-y-3">
                      {accountTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="grid gap-3 rounded-[24px] border border-line/70 bg-white px-5 py-4 lg:grid-cols-[minmax(0,1.3fr)_0.7fr_0.5fr]"
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
                                <ArrowDownLeft className="h-4 w-4" />
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
                  </div>
                </div>

                <div className="rounded-[30px] border border-line/70 bg-slate-50/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Statements</p>
                      <h3 className="mt-2 text-lg font-semibold text-ink">Download history</h3>
                    </div>
                    <FileText className="h-5 w-5 text-surge" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {accountStatements.map((statement) => (
                      <div key={statement.id} className="rounded-[24px] border border-line/70 bg-white p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-ink">{statement.periodLabel}</p>
                            <p className="mt-1 text-sm text-muted">
                              {statement.fileName}
                            </p>
                          </div>
                          <Badge className="border-line bg-white text-ink">{statement.status}</Badge>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-muted">
                          <p>
                            Period {statement.periodStart} to {statement.periodEnd}
                          </p>
                          <p>Closing balance {formatCurrency(statement.closingBalanceCents, account.currency)}</p>
                        </div>
                        <Link
                          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5"
                          href={`/api/statements/${statement.id}`}
                        >
                          <Download className="h-4 w-4" />
                          Download statement
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
