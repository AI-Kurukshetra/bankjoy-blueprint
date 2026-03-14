import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MfaSettingsPanel } from "@/components/dashboard/mfa-settings-panel";
import { Card } from "@/components/ui/card";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Security | Bankjoy",
};

export default async function SecurityPage() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[32px] bg-ink px-6 py-7 text-white shadow-panel">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/55">Security center</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_320px]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Protect your account with multi-factor verification.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Add an authenticator app to require a time-based verification code after password sign-in.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Account</p>
              <p className="mt-2 text-sm font-semibold text-white">{session.email}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Status</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {session.mode === "demo" ? "Unavailable in demo mode" : session.mfa.isEnabled ? "MFA enabled" : "MFA not enabled"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Card>
        <MfaSettingsPanel isDemoMode={session.mode === "demo"} />
      </Card>
    </div>
  );
}
