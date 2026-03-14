import { redirect } from "next/navigation";

import { getActiveSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getActiveSession();

  redirect(session ? "/dashboard" : "/login");
}
