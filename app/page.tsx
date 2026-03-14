import { redirect } from "next/navigation";

import { getAuthenticatedRedirectPath } from "@/lib/mfa";
import { getActiveSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getActiveSession();

  redirect(session ? getAuthenticatedRedirectPath(session.mfa) : "/login");
}
