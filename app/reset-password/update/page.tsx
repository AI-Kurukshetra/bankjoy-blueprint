import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { updatePasswordAction } from "@/app/(auth)/actions";
import { PasswordUpdateForm } from "@/components/auth/password-update-form";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Create New Password | Bankjoy",
};

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; message?: string; token_hash?: string; type?: string }>;
}) {
  const { code, error, message, token_hash: tokenHash, type } = await searchParams;

  if (code) {
    redirect(`/auth/confirm?code=${encodeURIComponent(code)}&next=${encodeURIComponent("/reset-password/update")}`);
  }

  if (tokenHash && type) {
    redirect(
      `/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}&next=${encodeURIComponent("/reset-password/update")}`,
    );
  }

  const isLiveSupabase = hasSupabaseEnv();
  let hasRecoverySession = false;

  if (isLiveSupabase) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasRecoverySession = Boolean(user);
  }

  return (
    <div className="app-grid min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[34px] bg-ink p-8 text-white shadow-panel lg:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">Security</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight">Create a new password.</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/70">
            Use a password that is unique to Bankjoy and not shared with other online accounts.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Password</p>
              <p className="mt-3 text-lg font-medium">Use at least 8 characters with strong variation</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Access</p>
              <p className="mt-3 text-lg font-medium">After updating, sign in again with your new credentials</p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Recovery</p>
            <h2 className="mt-3 text-3xl font-semibold">Set new password</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Confirm the recovery link and save a new password to restore account access.
            </p>
            {isLiveSupabase ? (
              <div
                className={
                  hasRecoverySession
                    ? "mt-5 rounded-2xl border border-surge/25 bg-surge/10 px-4 py-3 text-sm text-surge"
                    : "mt-5 rounded-2xl border border-line/70 bg-mist px-4 py-3 text-sm text-muted"
                }
              >
                {hasRecoverySession
                  ? "Recovery link verified. You can now create a new password."
                  : "Open this page using the secure password reset link from your email to continue."}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-line/70 bg-mist px-4 py-3 text-sm text-muted">
                Password recovery is currently unavailable in this environment.
              </div>
            )}
            {message ? (
              <div className="mt-5 rounded-2xl border border-surge/25 bg-surge/10 px-4 py-3 text-sm text-surge">{message}</div>
            ) : null}
            {error ? (
              <div className="mt-5 rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>
            ) : null}
            <div className="mt-6">
              <PasswordUpdateForm action={updatePasswordAction} disabled={!isLiveSupabase || !hasRecoverySession} />
            </div>
            <p className="mt-5 text-sm text-muted">
              Return to{" "}
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
