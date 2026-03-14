import { redirect } from "next/navigation";

import { getActiveSession } from "@/lib/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getActiveSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="app-grid min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[34px] bg-ink p-8 text-white shadow-panel lg:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">Digital banking</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight">
            Banking built for secure everyday money movement.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/70">
            Access balances, review account activity, move funds, and stay informed with real-time account alerts.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Alerts</p>
              <p className="mt-3 text-lg font-medium">Transaction updates and account security notices</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Transfers</p>
              <p className="mt-3 text-lg font-medium">Move money quickly between your eligible accounts</p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center">{children}</section>
      </div>
    </div>
  );
}
