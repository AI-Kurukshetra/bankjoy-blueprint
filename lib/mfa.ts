export type AssuranceLevel = "aal1" | "aal2" | null;

export type MfaState = {
  currentLevel: AssuranceLevel;
  nextLevel: AssuranceLevel;
  isEnabled: boolean;
  isRequired: boolean;
};

export function getMfaState(currentLevel: AssuranceLevel, nextLevel: AssuranceLevel): MfaState {
  const isEnabled = currentLevel === "aal2" || nextLevel === "aal2";
  const isRequired = currentLevel !== "aal2" && nextLevel === "aal2";

  return {
    currentLevel,
    nextLevel,
    isEnabled,
    isRequired,
  };
}

export function getAuthenticatedRedirectPath(mfaState: Pick<MfaState, "isRequired">) {
  return mfaState.isRequired ? "/mfa" : "/dashboard";
}

export function normalizeMfaQrCode(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("data:image")) {
    const separatorIndex = trimmedValue.indexOf(",");

    if (separatorIndex === -1) {
      return trimmedValue;
    }

    const metadata = trimmedValue.slice(0, separatorIndex);
    const payload = trimmedValue.slice(separatorIndex + 1).trim();

    if (payload.startsWith("<")) {
      return `${metadata},${encodeURIComponent(payload)}`;
    }

    return `${metadata},${payload}`;
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmedValue)}`;
}
