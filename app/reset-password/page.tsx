import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { PasswordResetRequestForm } from "@/components/auth/password-reset-request-form";
import { Card } from "@/components/ui/card";
import { getAuthenticatedRedirectPath } from "@/lib/mfa";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Reset Password | Bankjoy",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const session = await getActiveSession();

  if (session) {
    redirect(getAuthenticatedRedirectPath(session.mfa));
  }

  return (
    <div className="app-grid min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[34px] bg-ink p-8 text-white shadow-panel lg:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">Account access</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight">Reset your password securely.</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/70">
            Enter your email address and we will send you a secure link to create a new password.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Security</p>
              <p className="mt-3 text-lg font-medium">Recovery links are time-limited and single-purpose</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Support</p>
              <p className="mt-3 text-lg font-medium">If you did not request this, no action is required</p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Password recovery</p>
            <h2 className="mt-3 text-3xl font-semibold">Send reset link</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              We’ll email instructions to the address linked to your Bankjoy profile.
            </p>
            {message ? (
              <div className="mt-5 rounded-2xl border border-surge/25 bg-surge/10 px-4 py-3 text-sm text-surge">{message}</div>
            ) : null}
            {error ? (
              <div className="mt-5 rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>
            ) : null}
            <div className="mt-6">
              <PasswordResetRequestForm action={requestPasswordResetAction} />
            </div>
            <p className="mt-5 text-sm text-muted">
              Back to{" "}
              <Link className="font-medium text-ink" href="/login">
                sign in
              </Link>
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
