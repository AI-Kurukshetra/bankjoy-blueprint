import type { Metadata } from "next";

import { AccountManagement } from "@/components/dashboard/account-management";
import { getAccountManagementSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Accounts | Bankjoy",
};

export default async function AccountsPage() {
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  const snapshot = await getAccountManagementSnapshot(session);

  return (
    <AccountManagement
      accounts={snapshot.accounts}
      statements={snapshot.statements}
      transactions={snapshot.transactions}
    />
  );
}
