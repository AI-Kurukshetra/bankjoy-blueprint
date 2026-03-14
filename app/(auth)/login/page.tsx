import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";
import { loginAction } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Login | Bankjoy",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <Card className="w-full max-w-md">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Member login</p>
      <h2 className="mt-3 text-3xl font-semibold">Sign in to your banking workspace</h2>
      <p className="mt-3 text-sm leading-6 text-muted">Sign in with your email address and password to access your accounts.</p>
      {message ? (
        <div className="mt-5 rounded-2xl border border-surge/25 bg-surge/10 px-4 py-3 text-sm text-surge">{message}</div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>
      ) : null}
      <div className="mt-6">
        <AuthForm action={loginAction} mode="login" />
      </div>
      <p className="mt-4 text-sm text-muted">
        Forgot your password?{" "}
        <Link className="font-medium text-ink" href="/reset-password">
          Reset it
        </Link>
      </p>
      <p className="mt-5 text-sm text-muted">
        Need an account?{" "}
        <Link className="font-medium text-ink" href="/signup">
          Create one
        </Link>
      </p>
    </Card>
  );
}
