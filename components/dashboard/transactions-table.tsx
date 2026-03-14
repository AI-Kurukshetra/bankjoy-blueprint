"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Transaction } from "@/lib/demo-bank-data";
import { cn, formatCurrency, formatRelativeDate } from "@/lib/utils";

type TransactionsTableProps = {
  transactions: Transaction[];
};

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(transactions[0]?.id ?? null);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return transactions;
    }

    return transactions.filter((transaction) =>
      [transaction.description, transaction.merchantName, transaction.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, transactions]);

  const selectedTransaction =
    filteredTransactions.find((transaction) => transaction.id === selectedId) ?? filteredTransactions[0] ?? null;

  return (
    <div className="space-y-6">
      <Card className="rounded-[34px]">
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Ledger</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Transaction history</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Search the ledger, inspect transaction metadata, and keep more of the list visible on wide screens.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
            <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Total rows</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{transactions.length}</p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Credits</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {transactions.filter((item) => item.direction === "credit").length}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Debits</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {transactions.filter((item) => item.direction === "debit").length}
              </p>
            </div>
          </div>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_430px]">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Search</p>
              <h2 className="mt-2 text-2xl font-semibold">Activity stream</h2>
            </div>
            <div className="w-full max-w-md">
              <Input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search merchants, categories, or notes"
                value={query}
              />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <button
                  key={transaction.id}
                  className={cn(
                    "grid w-full gap-4 rounded-[24px] border px-5 py-4 text-left transition lg:grid-cols-[minmax(0,1.5fr)_0.65fr_0.55fr]",
                    selectedTransaction?.id === transaction.id
                      ? "border-surge bg-surge/5"
                      : "border-line/70 bg-white hover:border-surge/40",
                  )}
                  onClick={() => setSelectedId(transaction.id)}
                  type="button"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-ink">{transaction.description}</p>
                    <p className="mt-1 truncate text-sm text-muted">
                      {transaction.merchantName} • {transaction.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 lg:justify-center">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                      {transaction.status}
                    </span>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-sm font-semibold text-ink">
                      {transaction.direction === "credit" ? "+" : "-"}
                      {formatCurrency(transaction.amountCents)}
                    </p>
                    <p className="text-xs text-muted">{formatRelativeDate(transaction.occurredAt)}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-mist p-10 text-center text-sm text-muted">
                No transactions match your search.
              </div>
            )}
          </div>
        </Card>
        <Card className="h-fit">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Details</p>
          {selectedTransaction ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-muted">Description</p>
                <p className="mt-1 text-lg font-semibold text-ink">{selectedTransaction.description}</p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[22px] bg-mist p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Merchant</p>
                  <p className="mt-2 font-medium text-ink">{selectedTransaction.merchantName}</p>
                </div>
                <div className="rounded-[22px] bg-dune p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Category</p>
                  <p className="mt-2 font-medium text-ink">{selectedTransaction.category}</p>
                </div>
              </div>
              <div className="rounded-[22px] border border-line/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Amount</p>
                <p className="mt-2 text-3xl font-semibold text-ink">
                  {selectedTransaction.direction === "credit" ? "+" : "-"}
                  {formatCurrency(selectedTransaction.amountCents)}
                </p>
              </div>
              <div className="rounded-[22px] border border-line/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Status</p>
                <p className="mt-2 font-medium capitalize text-ink">{selectedTransaction.status}</p>
                <p className="mt-2 text-sm text-muted">{formatRelativeDate(selectedTransaction.occurredAt)}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-mist p-6 text-sm text-muted">
              Select a transaction to inspect its details.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
