"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEMO_SESSION_COOKIE } from "@/lib/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  authSchema,
  passwordResetRequestSchema,
  passwordUpdateSchema,
  transferSchema,
} from "@/lib/validations/auth";
import { recordDemoTransfer } from "@/lib/demo-bank-data";

export async function loginAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid login details.")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const cookieStore = await cookies();
    cookieStore.set(
      DEMO_SESSION_COOKIE,
      JSON.stringify({
        userId: "demo-member-001",
        email: parsed.data.email,
        fullName: parsed.data.email.includes("admin") ? "Operations Manager" : "Account Holder",
        role: parsed.data.email.includes("admin") ? "admin" : "member",
        mode: "demo",
      }),
      { httpOnly: true, path: "/", sameSite: "lax" },
    );
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/signup?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Unable to create account.")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          role: "member",
        },
      },
    });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    if (!data.session) {
      redirect("/login?message=Account created. Confirm email if required, then sign in.");
    }
  } else {
    const cookieStore = await cookies();
    cookieStore.set(
      DEMO_SESSION_COOKIE,
      JSON.stringify({
        userId: "demo-member-001",
        email: parsed.data.email,
        fullName: parsed.data.fullName ?? "Account Holder",
        role: "member",
        mode: "demo",
      }),
      { httpOnly: true, path: "/", sameSite: "lax" },
    );
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
  cookieStore.delete("bankjoy-demo-transfers");
  cookieStore.delete("bankjoy-demo-notifications");
  cookieStore.delete("bankjoy-demo-admin-events");

  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect(
      `/reset-password?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Unable to start password reset.")}`,
    );
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${appUrl}/reset-password/update`,
    });

    if (error) {
      redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect(
    `/reset-password?message=${encodeURIComponent(
      "If an account matches that email, a password reset link has been sent.",
    )}`,
  );
}

export async function updatePasswordAction(formData: FormData) {
  const parsed = passwordUpdateSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect(
      `/reset-password/update?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Unable to update password.")}`,
    );
  }

  if (!hasSupabaseEnv()) {
    redirect(
      `/reset-password/update?message=${encodeURIComponent(
        "Password updated. Sign in again with your new credentials.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    redirect(`/reset-password/update?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("Password updated. Sign in with your new password.")}`,
  );
}

export async function transferAction(formData: FormData) {
  const parsed = transferSchema.safeParse({
    fromAccountId: formData.get("fromAccountId"),
    toAccountId: formData.get("toAccountId"),
    amount: formData.get("amount"),
    memo: formData.get("memo"),
  });

  if (!parsed.success) {
    redirect(`/dashboard/transfers?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Transfer failed.")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_internal_transfer", {
      p_from_account_id: parsed.data.fromAccountId,
      p_to_account_id: parsed.data.toAccountId,
      p_amount_cents: Math.round(parsed.data.amount * 100),
      p_memo: parsed.data.memo ?? null,
    });

    if (error) {
      redirect(`/dashboard/transfers?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    await recordDemoTransfer({
      id: `trf-${crypto.randomUUID()}`,
      fromAccountId: parsed.data.fromAccountId,
      toAccountId: parsed.data.toAccountId,
      amountCents: Math.round(parsed.data.amount * 100),
      memo: parsed.data.memo ?? "",
      status: "completed",
      createdAt: new Date().toISOString(),
    });
  }

  redirect("/dashboard/transfers?success=1");
}
