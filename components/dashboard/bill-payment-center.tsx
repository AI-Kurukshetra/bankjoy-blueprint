"use client";

import { useFormStatus } from "react-dom";
import { Receipt, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Account } from "@/lib/demo-bank-data";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";

export type BillPaymentRecord = {
  id: string;
  fromAccountId: string;
  payeeName: string;
  payeeCategory: string;
  amountCents: number;
  status: "scheduled" | "processing" | "paid";
  deliverBy: string;
  memo: string;
  processedAt: string | null;
  createdAt: string;
};

type BillPaymentCenterProps = {
  accounts: Account[];
  action: (formData: FormData) => void;
  billPayments: BillPaymentRecord[];
  error?: string;
  message?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit">
      {pending ? "Submitting..." : "Schedule bill payment"}
    </Button>
  );
}

export function BillPaymentCenter({
  accounts,
  action,
  billPayments,
  error,
  message,
}: BillPaymentCenterProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#12263a_0%,#1f3a57_62%,#d9a441_180%)] p-8 text-white shadow-panel xl:col-span-8">
          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/58">Bill pay</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight xl:text-5xl">Schedule and track outgoing payments</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
                Create upcoming payments, track completed bill activity, and keep recurring obligations visible inside the banking workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Accounts</p>
                <p className="mt-2 text-3xl font-semibold">{accounts.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Bill payments</p>
                <p className="mt-2 text-3xl font-semibold">{billPayments.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-sm text-white/65">Upcoming</p>
                <p className="mt-2 text-3xl font-semibold">
                  {billPayments.filter((payment) => payment.status === "scheduled").length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Card className="xl:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Control center</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Payment overview</h2>
          <div className="mt-5 space-y-3">
            {billPayments.slice(0, 3).map((payment) => (
              <div key={payment.id} className="rounded-[22px] border border-line/80 bg-slate-50/95 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{payment.payeeName}</p>
                    <p className="mt-1 text-sm text-muted">{payment.payeeCategory}</p>
                  </div>
                  <Badge className="border-line bg-white text-ink">{payment.status}</Badge>
                </div>
                <p className="mt-3 text-sm font-medium text-ink">{formatCurrency(payment.amountCents)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_0.95fr]">
        <Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Schedule payment</p>
              <h2 className="mt-2 text-3xl font-semibold">Create a bill payment</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Payments dated today are posted immediately in this MVP. Future-dated payments remain scheduled until their delivery date.
              </p>
              {message ? (
                <div className="mt-5 rounded-2xl border border-surge/25 bg-surge/10 px-4 py-3 text-sm text-surge">{message}</div>
              ) : null}
              {error ? (
                <div className="mt-5 rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>
              ) : null}
            </div>
            <form action={action} className="space-y-4">
              <label className="block space-y-2 text-sm text-muted">
                From account
                <select className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink" name="fromAccountId">
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} • {formatCurrency(account.balanceCents)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm text-muted">
                Payee
                <Input name="payeeName" placeholder="City Power" required />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm text-muted">
                  Category
                  <Input name="payeeCategory" placeholder="Utilities" required />
                </label>
                <label className="block space-y-2 text-sm text-muted">
                  Amount
                  <Input min="1" name="amount" placeholder="129.90" required step="0.01" type="number" />
                </label>
              </div>
              <label className="block space-y-2 text-sm text-muted">
                Deliver by
                <Input min={new Date().toISOString().slice(0, 10)} name="deliverBy" required type="date" />
              </label>
              <label className="block space-y-2 text-sm text-muted">
                Memo
                <Input name="memo" placeholder="March electricity bill" />
              </label>
              <SubmitButton />
            </form>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Payment activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Bill payment history</h2>
            </div>
            <Receipt className="h-5 w-5 text-surge" />
          </div>
          <div className="mt-6 space-y-3">
            {billPayments.map((payment) => (
              <div key={payment.id} className="rounded-[22px] border border-line/70 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-ink">{payment.payeeName}</p>
                    <p className="mt-1 text-sm text-muted">{payment.memo || payment.payeeCategory}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">{formatCurrency(payment.amountCents)}</p>
                    <Badge className="mt-2 border-line bg-white text-ink">{payment.status}</Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-line/80 bg-slate-50/95 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Due</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{payment.deliverBy}</p>
                  </div>
                  <div className="rounded-2xl border border-line/80 bg-slate-50/95 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Created</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{formatRelativeDate(payment.createdAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-line/80 bg-slate-50/95 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Processed</p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {payment.processedAt ? formatRelativeDate(payment.processedAt) : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-surge" />
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{account.type}</p>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-ink">{account.name}</h3>
            <p className="mt-2 text-3xl font-semibold text-ink">{formatCurrency(account.balanceCents)}</p>
            <p className="mt-2 text-sm text-muted">{account.mask}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
