import type { Metadata } from "next";

import { linkExternalAccountAction } from "@/app/(dashboard)/actions";
import { AccountManagement } from "@/components/dashboard/account-management";
import { getAccountManagementSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Accounts | Bankjoy",
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  const snapshot = await getAccountManagementSnapshot(session);

  return (
    <AccountManagement
      action={linkExternalAccountAction}
      accounts={snapshot.accounts}
      error={error}
      externalAccounts={snapshot.externalAccounts}
      message={message}
      statements={snapshot.statements}
      transactions={snapshot.transactions}
    />
  );
}
