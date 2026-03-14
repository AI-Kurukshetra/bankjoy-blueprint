import { cookies } from "next/headers";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const DEMO_SESSION_COOKIE = "bankjoy-demo-session";

export type AppSession = {
  userId: string;
  email: string;
  fullName: string;
  role: "member" | "admin";
  mode: "demo" | "supabase";
};

export async function getActiveSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const demoSessionValue = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  if (demoSessionValue) {
    return JSON.parse(demoSessionValue) as AppSession;
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
  };
}
