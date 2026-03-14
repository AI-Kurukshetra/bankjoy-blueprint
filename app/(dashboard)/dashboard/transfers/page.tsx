import type { Metadata } from "next";

import { transferAction } from "@/app/(auth)/actions";
import { TransferForm } from "@/components/dashboard/transfer-form";
import { Card } from "@/components/ui/card";
import { getBankingSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Transfers | Bankjoy",
};

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  const snapshot = await getBankingSnapshot(session);
  const { error, success } = await searchParams;

  return (
    <div className="space-y-6">
      {success ? (
        <Card className="border-surge/25 bg-surge/10">
          <p className="text-sm font-medium text-surge">Transfer completed successfully. Your account activity has been updated.</p>
        </Card>
      ) : null}
      {error ? (
        <Card className="border-ember/25 bg-ember/10">
          <p className="text-sm font-medium text-ember">{error}</p>
        </Card>
      ) : null}
      <TransferForm accounts={snapshot.accounts} action={transferAction} transfers={snapshot.transfers} />
    </div>
  );
}
