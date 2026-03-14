import type { Metadata } from "next";
import Link from "next/link";

import { signupAction } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign Up | Bankjoy",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card className="w-full max-w-md">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Open account</p>
      <h2 className="mt-3 text-3xl font-semibold">Create your digital banking profile</h2>
      <p className="mt-3 text-sm leading-6 text-muted">Create your secure profile to access balances, transfers, and account alerts.</p>
      {error ? (
        <div className="mt-5 rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>
      ) : null}
      <div className="mt-6">
        <AuthForm action={signupAction} mode="signup" />
      </div>
      <p className="mt-5 text-sm text-muted">
        Already onboarded?{" "}
        <Link className="font-medium text-ink" href="/login">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
