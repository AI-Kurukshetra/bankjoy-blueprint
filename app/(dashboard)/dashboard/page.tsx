import type { Metadata } from "next";

import { Overview } from "@/components/dashboard/overview";
import { getBankingSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard | Bankjoy",
};

export default async function DashboardPage() {
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  const snapshot = await getBankingSnapshot(session);

  return (
    <Overview
      accounts={snapshot.accounts}
      notifications={snapshot.notifications}
      transactions={snapshot.transactions}
    />
  );
}
