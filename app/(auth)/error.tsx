"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AuthError({
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
    <Card className="w-full max-w-md">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-ember">Auth error</p>
      <h2 className="mt-3 text-3xl font-semibold">We could not complete authentication.</h2>
      <p className="mt-3 text-sm leading-6 text-muted">{error.message}</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}
