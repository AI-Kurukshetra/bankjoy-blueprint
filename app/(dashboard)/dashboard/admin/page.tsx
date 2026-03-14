import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminMonitor } from "@/components/dashboard/admin-monitor";
import { getAdminSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Operations | Bankjoy",
};

export default async function AdminPage() {
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  const snapshot = await getAdminSnapshot(session);

  return (
    <AdminMonitor
      adminEvents={snapshot.adminEvents}
      profiles={snapshot.profiles}
      session={session}
      transactions={snapshot.transactions}
    />
  );
}
