import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Account, Transfer } from "@/lib/demo-bank-data";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";

type TransferFormProps = {
  accounts: Account[];
  transfers: Transfer[];
  action: (formData: FormData) => Promise<void>;
};

export function TransferForm({ accounts, transfers, action }: TransferFormProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[34px]">
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Move money</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Internal transfer</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Move funds between eligible accounts with a clear review flow and a complete transfer history.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
            {accounts.map((account) => (
              <div key={account.id} className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">{account.type}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{account.name}</p>
                <p className="mt-1 text-sm text-muted">{formatCurrency(account.balanceCents)}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-line/70 bg-mist px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Transfers</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{transfers.length}</p>
            </div>
          </div>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Payment rail</p>
              <h2 className="mt-2 text-3xl font-semibold">Transfer funds</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Submit a transfer to update balances, record account activity, and notify the account holder.
              </p>
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
                To account
                <select className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink" name="toAccountId">
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} • {formatCurrency(account.balanceCents)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm text-muted">
                  Amount
                  <Input min="1" name="amount" placeholder="250.00" required step="0.01" type="number" />
                </label>
                <label className="block space-y-2 text-sm text-muted">
                  Memo
                  <Input name="memo" placeholder="Monthly savings transfer" />
                </label>
              </div>
              <Button className="w-full" type="submit">
                Confirm transfer
              </Button>
            </form>
          </div>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">History</p>
          <h2 className="mt-2 text-2xl font-semibold">Transfer activity</h2>
          <div className="mt-6 space-y-3">
            {transfers.map((transfer) => (
              <div key={transfer.id} className="rounded-[22px] border border-line/70 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-ink">{formatCurrency(transfer.amountCents)}</p>
                    <p className="mt-1 text-sm text-muted">{transfer.memo || "Internal transfer"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-surge">{transfer.status}</p>
                    <p className="mt-1 text-xs text-muted">{formatRelativeDate(transfer.createdAt)}</p>
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
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{account.type}</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{account.name}</h3>
            <p className="mt-2 text-3xl font-semibold text-ink">{formatCurrency(account.balanceCents)}</p>
            <p className="mt-2 text-sm text-muted">{account.mask}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
