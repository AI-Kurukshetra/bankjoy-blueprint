import { cookies } from "next/headers";

import { getMfaState, type MfaState } from "@/lib/mfa";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const DEMO_SESSION_COOKIE = "bankjoy-demo-session";

export type AppSession = {
  userId: string;
  email: string;
  fullName: string;
  role: "member" | "admin";
  mode: "demo" | "supabase";
  mfa: MfaState;
};

export async function getActiveSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const demoSessionValue = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  if (demoSessionValue) {
    const demoSession = JSON.parse(demoSessionValue) as Partial<AppSession>;

    return {
      userId: demoSession.userId ?? "demo-member-001",
      email: demoSession.email ?? "member@example.com",
      fullName: demoSession.fullName ?? "Account Holder",
      role: demoSession.role ?? "member",
      mode: "demo",
      mfa: demoSession.mfa ?? getMfaState(null, null),
    };
  }

  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const mfa = getMfaState(assurance?.currentLevel ?? null, assurance?.nextLevel ?? null);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? "member@example.com",
    fullName: profile?.full_name ?? user.user_metadata.full_name ?? "Member",
    role: (profile?.role as "member" | "admin" | undefined) ?? (user.user_metadata.role as "member" | "admin" | undefined) ?? "member",
    mode: "supabase",
    mfa,
  };
}
