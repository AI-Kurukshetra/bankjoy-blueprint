"use client";

import { useFormStatus } from "react-dom";
import { Building2, Link2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  EXTERNAL_ACCOUNT_TYPES,
  formatExternalAccountType,
  type ExternalAccountRecord,
} from "@/lib/external-accounts";
import { formatRelativeDate } from "@/lib/utils";

type ExternalAccountLinkerProps = {
  action: (formData: FormData) => void;
  externalAccounts: ExternalAccountRecord[];
  error?: string;
  message?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" type="submit">
      {pending ? "Linking..." : "Link external account"}
    </Button>
  );
}

export function ExternalAccountLinker({
  action,
  externalAccounts,
  error,
  message,
}: ExternalAccountLinkerProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <Card className="xl:col-span-5">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">External linking</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Connect an outside account</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Add another bank account for future transfer and payment workflows. The MVP stores masked account details only.
        </p>
        {message ? (
          <div className="mt-5 rounded-2xl border border-surge/25 bg-surge/10 px-4 py-3 text-sm text-surge">{message}</div>
        ) : null}
        {error ? (
          <div className="mt-5 rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>
        ) : null}
        <form action={action} className="mt-6 grid gap-4">
          <label className="block space-y-2 text-sm text-muted">
            Financial institution
            <Input name="institutionName" placeholder="North Harbor Bank" required />
          </label>
          <label className="block space-y-2 text-sm text-muted">
            Account nickname
            <Input name="accountName" placeholder="Household checking" required />
          </label>
          <label className="block space-y-2 text-sm text-muted">
            Account type
            <select
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-surge focus:ring-2 focus:ring-surge/15"
              defaultValue="checking"
              name="accountType"
            >
              {EXTERNAL_ACCOUNT_TYPES.map((accountType) => (
                <option key={accountType} value={accountType}>
                  {formatExternalAccountType(accountType)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2 text-sm text-muted">
              Routing number
              <Input inputMode="numeric" maxLength={9} name="routingNumber" placeholder="021000021" required />
            </label>
            <label className="block space-y-2 text-sm text-muted">
              Account number
              <Input inputMode="numeric" maxLength={17} name="accountNumber" placeholder="9876543210" required />
            </label>
          </div>
          <div className="rounded-[22px] border border-line/80 bg-slate-50/95 px-4 py-4 text-sm text-muted">
            The linked account will appear immediately with masked details and a current sync timestamp.
          </div>
          <SubmitButton />
        </form>
      </Card>

      <div className="grid gap-6 xl:col-span-7 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Linked accounts</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">External relationship center</h2>
            </div>
            <Link2 className="h-5 w-5 text-surge" />
          </div>
          <div className="mt-5 space-y-3">
            {externalAccounts.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-line/80 bg-slate-50/80 px-5 py-6 text-sm text-muted">
                No external accounts are linked yet.
              </div>
            ) : (
              externalAccounts.map((account) => (
                <div key={account.id} className="rounded-[24px] border border-line/80 bg-slate-50/95 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{account.institutionName}</p>
                      <p className="mt-1 text-sm text-muted">
                        {account.accountName} · {formatExternalAccountType(account.accountType)}
                      </p>
                    </div>
                    <Badge className="border-line bg-white text-ink">{account.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Routing</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{account.routingMask}</p>
                    </div>
                    <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Account</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{account.accountMask}</p>
                    </div>
                    <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Last sync</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{formatRelativeDate(account.lastSyncAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Controls</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-[24px] border border-line/80 bg-slate-50/95 p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-surge" />
                <p className="text-sm font-semibold text-ink">{externalAccounts.length} linked institutions</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Added accounts are ready for the next transfer and bill-pay phases.
              </p>
            </div>
            <div className="rounded-[24px] border border-line/80 bg-slate-50/95 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-surge" />
                <p className="text-sm font-semibold text-ink">Masked detail storage</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Only masked routing and account numbers are retained in this MVP flow.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
