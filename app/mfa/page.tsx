import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { MfaChallengeForm } from "@/components/auth/mfa-challenge-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAuthenticatedRedirectPath } from "@/lib/mfa";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Verify Sign In | Bankjoy",
};

export default async function MfaPage() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.mfa.isRequired) {
    redirect(getAuthenticatedRedirectPath(session.mfa));
  }

  return (
    <div className="app-grid min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[34px] bg-ink p-8 text-white shadow-panel lg:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">Verification</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight">Finish signing in with your authenticator app.</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/70">
            Enter the current six-digit code from your authenticator app to unlock the banking workspace.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Account</p>
              <p className="mt-3 text-lg font-medium">{session.email}</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Security level</p>
              <p className="mt-3 text-lg font-medium">Multi-factor required</p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Multi-factor authentication</p>
            <h2 className="mt-3 text-3xl font-semibold">Verify your sign-in</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Use the time-based code from the authenticator app you enrolled for this Bankjoy profile.
            </p>
            <div className="mt-6">
              <MfaChallengeForm />
            </div>
            <form action={logoutAction} className="mt-4">
              <Button className="w-full" type="submit" variant="secondary">
                Sign out instead
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}
