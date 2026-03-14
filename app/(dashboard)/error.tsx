"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="border-ember/25 bg-white/90">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-ember">Dashboard error</p>
      <h2 className="mt-3 text-3xl font-semibold text-ink">The banking workspace hit a runtime issue.</h2>
      <p className="mt-3 text-sm leading-6 text-muted">{error.message}</p>
      <Button className="mt-6" onClick={reset}>
        Reload section
      </Button>
    </Card>
  );
}
