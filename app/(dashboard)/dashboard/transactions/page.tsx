import type { Metadata } from "next";

import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { getBankingSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Transactions | Bankjoy",
};

export default async function TransactionsPage() {
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  const snapshot = await getBankingSnapshot(session);

  return <TransactionsTable transactions={snapshot.transactions} />;
}
