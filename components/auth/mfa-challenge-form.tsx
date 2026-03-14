"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type VerifiedFactor = {
  id: string;
  friendlyName: string;
};

export function MfaChallengeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [factor, setFactor] = useState<VerifiedFactor | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFactor() {
      const supabase = createClient();
      const { data, error: listError } = await supabase.auth.mfa.listFactors();

      if (!isMounted) {
        return;
      }

      if (listError) {
        setError(listError.message);
        setIsLoading(false);
        return;
      }

      const verifiedFactor = data.totp[0];

      if (!verifiedFactor) {
        setError("No verified authenticator app is available for this account.");
        setIsLoading(false);
        return;
      }

      setFactor({
        id: verifiedFactor.id,
        friendlyName: verifiedFactor.friendly_name || "Authenticator app",
      });
      setIsLoading(false);
    }

    void loadFactor();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!factor) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code,
    });

    if (verifyError) {
      setError(verifyError.message);
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      {factor ? (
        <div className="rounded-2xl border border-line/80 bg-slate-50/95 px-4 py-3 text-sm text-muted">
          Verifying with <span className="font-medium text-ink">{factor.friendlyName}</span>
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>
      ) : null}
      <label className="block space-y-2 text-sm text-muted">
        Authentication code
        <Input
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          name="code"
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          value={code}
        />
      </label>
      <Button className="w-full" disabled={isLoading || isSubmitting || code.length !== 6 || !factor} type="submit">
        {isSubmitting ? "Verifying..." : "Verify and continue"}
      </Button>
    </form>
  );
}
