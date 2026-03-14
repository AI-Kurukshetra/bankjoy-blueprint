import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { AppShell } from "@/components/dashboard/app-shell";
import { getBankingSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  if (session.mfa.isRequired) {
    redirect("/mfa");
  }

  const snapshot = await getBankingSnapshot(session);

  return (
    <AppShell logoutAction={logoutAction} notifications={snapshot.notifications} session={session}>
      {children}
    </AppShell>
  );
}
