"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeMfaQrCode } from "@/lib/mfa";
import { createClient } from "@/lib/supabase/client";

type MfaSettingsPanelProps = {
  isDemoMode: boolean;
};

type MfaFactor = {
  id: string;
  friendlyName: string;
  status: "verified" | "unverified";
};

type EnrollmentState = {
  factorId: string;
  friendlyName: string;
  qrCode: string;
  secret: string;
};

type AssuranceSummary = {
  currentLevel: string | null;
  nextLevel: string | null;
};

export function MfaSettingsPanel({ isDemoMode }: MfaSettingsPanelProps) {
  const router = useRouter();
  const [friendlyName, setFriendlyName] = useState("Bankjoy Authenticator");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isDemoMode);
  const [isWorking, setIsWorking] = useState(false);
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [assurance, setAssurance] = useState<AssuranceSummary>({ currentLevel: null, nextLevel: null });
  const [enrollment, setEnrollment] = useState<EnrollmentState | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    let isMounted = true;

    async function loadState() {
      const supabase = createClient();
      const [{ data: assuranceData, error: assuranceError }, { data: factorsData, error: factorsError }] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);

      if (!isMounted) {
        return;
      }

      if (assuranceError) {
        setError(assuranceError.message);
        setIsLoading(false);
        return;
      }

      if (factorsError) {
        setError(factorsError.message);
        setIsLoading(false);
        return;
      }

      setAssurance({
        currentLevel: assuranceData.currentLevel,
        nextLevel: assuranceData.nextLevel,
      });

      setFactors(
        factorsData.all.map((factor) => ({
          id: factor.id,
          friendlyName: factor.friendly_name || "Authenticator app",
          status: factor.status,
        })),
      );
      setIsLoading(false);
    }

    void loadState();

    return () => {
      isMounted = false;
    };
  }, [isDemoMode]);

  async function refreshState() {
    const supabase = createClient();
    const [{ data: assuranceData, error: assuranceError }, { data: factorsData, error: factorsError }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);

    if (assuranceError) {
      throw new Error(assuranceError.message);
    }

    if (factorsError) {
      throw new Error(factorsError.message);
    }

    setAssurance({
      currentLevel: assuranceData.currentLevel,
      nextLevel: assuranceData.nextLevel,
    });

    setFactors(
      factorsData.all.map((factor) => ({
        id: factor.id,
        friendlyName: factor.friendly_name || "Authenticator app",
        status: factor.status,
      })),
    );
  }

  async function handleEnroll() {
    setIsWorking(true);
    setError(null);

    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: friendlyName.trim() || "Bankjoy Authenticator",
    });

    if (enrollError) {
      setError(enrollError.message);
      setIsWorking(false);
      return;
    }

    setEnrollment({
      factorId: data.id,
      friendlyName: data.friendly_name || "Bankjoy Authenticator",
      qrCode: normalizeMfaQrCode(data.totp.qr_code),
      secret: data.totp.secret,
    });
    setCode("");
    setIsWorking(false);
    await refreshState();
  }

  async function handleVerify() {
    if (!enrollment) {
      return;
    }

    setIsWorking(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollment.factorId,
      code,
    });

    if (verifyError) {
      setError(verifyError.message);
      setIsWorking(false);
      return;
    }

    setEnrollment(null);
    setCode("");
    await refreshState();
    router.refresh();
    setIsWorking(false);
  }

  async function handleRemoveFactor(factorId: string) {
    setIsWorking(true);
    setError(null);

    const supabase = createClient();
    const { error: removeError } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (removeError) {
      setError(removeError.message);
      setIsWorking(false);
      return;
    }

    if (enrollment?.factorId === factorId) {
      setEnrollment(null);
      setCode("");
    }

    await refreshState();
    router.refresh();
    setIsWorking(false);
  }

  if (isDemoMode) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Authenticator app</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">MFA setup requires a live Supabase-authenticated session.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Demo mode keeps the product walkthrough available without external auth configuration, so multi-factor enrollment is disabled here.
          </p>
        </div>
        <div className="rounded-[26px] border border-line/80 bg-slate-50/95 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Mode</p>
          <p className="mt-3 text-sm font-semibold text-ink">Demo session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Authenticator app</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink">Time-based verification</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Enroll a TOTP authenticator app to require a rotating code after password sign-in. If Supabase TOTP is disabled for the project, enable it in the Auth MFA settings first.
        </p>
        {error ? (
          <div className="mt-5 rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>
        ) : null}
        <div className="mt-6 grid gap-4 rounded-[28px] border border-line/80 bg-slate-50/95 p-5">
          <label className="block space-y-2 text-sm text-muted">
            Device label
            <Input onChange={(event) => setFriendlyName(event.target.value)} value={friendlyName} />
          </label>
          <Button className="w-full sm:w-auto" disabled={isLoading || isWorking} onClick={() => void handleEnroll()}>
            {isWorking && enrollment === null ? "Preparing..." : "Set up authenticator app"}
          </Button>
        </div>

        {enrollment ? (
          <div className="mt-6 rounded-[28px] border border-line/80 bg-white p-5 shadow-panel">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Pending verification</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">{enrollment.friendlyName}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Scan the QR code in your authenticator app, then enter the current six-digit code to finish enrollment.
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
              <div className="rounded-[24px] border border-line/80 bg-slate-50 p-4">
                <Image
                  alt="Authenticator QR code"
                  className="mx-auto h-[188px] w-[188px]"
                  height={188}
                  src={enrollment.qrCode}
                  unoptimized
                  width={188}
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-line/80 bg-slate-50/95 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Manual setup key</p>
                  <p className="mt-2 break-all font-mono text-sm text-ink">{enrollment.secret}</p>
                </div>
                <label className="block space-y-2 text-sm text-muted">
                  Verification code
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    value={code}
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <Button disabled={isWorking || code.length !== 6} onClick={() => void handleVerify()}>
                    {isWorking ? "Verifying..." : "Verify and enable"}
                  </Button>
                  <Button disabled={isWorking} onClick={() => void handleRemoveFactor(enrollment.factorId)} variant="secondary">
                    Cancel setup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-line/80 bg-slate-50/95 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Session assurance</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-line/80 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Current</p>
              <p className="mt-2 text-sm font-semibold text-ink">{assurance.currentLevel ?? "Not available"}</p>
            </div>
            <div className="rounded-2xl border border-line/80 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Next</p>
              <p className="mt-2 text-sm font-semibold text-ink">{assurance.nextLevel ?? "Not available"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-line/80 bg-white p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Enrolled factors</p>
          <div className="mt-4 space-y-3">
            {factors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line/80 px-4 py-4 text-sm text-muted">
                No authenticator app is enrolled yet.
              </div>
            ) : (
              factors.map((factor) => (
                <div key={factor.id} className="rounded-2xl border border-line/80 bg-slate-50/95 px-4 py-4">
                  <p className="text-sm font-semibold text-ink">{factor.friendlyName}</p>
                  <p className="mt-1 text-sm text-muted">{factor.status === "verified" ? "Verified" : "Pending verification"}</p>
                  <Button className="mt-3" disabled={isWorking} onClick={() => void handleRemoveFactor(factor.id)} variant="secondary">
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
