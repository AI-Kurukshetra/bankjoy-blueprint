import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

const DEFAULT_RECOVERY_PATH = "/reset-password/update";

function getSafeRedirectPath(request: NextRequest, candidate: string | null, fallbackPath: string) {
  if (!candidate) {
    return fallbackPath;
  }

  try {
    const url = new URL(candidate, request.nextUrl.origin);

    if (url.origin !== request.nextUrl.origin) {
      return fallbackPath;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallbackPath;
  }
}

export async function GET(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const code = request.nextUrl.searchParams.get("code");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = request.nextUrl.searchParams.get("next");
  const redirectTo = request.nextUrl.searchParams.get("redirect_to");
  const inferredRecovery = Boolean(tokenHash) || request.nextUrl.pathname.includes("reset-password");
  const fallbackPath = type === "recovery" || inferredRecovery ? DEFAULT_RECOVERY_PATH : "/dashboard";
  const targetPath = getSafeRedirectPath(request, next ?? redirectTo, fallbackPath);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const errorUrl = request.nextUrl.clone();
      errorUrl.pathname = "/reset-password";
      errorUrl.search = `error=${encodeURIComponent(error.message)}`;
      return NextResponse.redirect(errorUrl);
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
    redirectUrl.search = "";
    const redirectResponse = NextResponse.redirect(redirectUrl);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  if (!tokenHash || !type) {
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = "/reset-password";
    errorUrl.search = `error=${encodeURIComponent("This recovery link is invalid or incomplete.")}`;
    return NextResponse.redirect(errorUrl);
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = type === "recovery" ? "/reset-password" : "/login";
    errorUrl.search = `error=${encodeURIComponent(error.message)}`;
    return NextResponse.redirect(errorUrl);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  redirectUrl.search = "";
  const redirectResponse = NextResponse.redirect(redirectUrl);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
