const LOCAL_APP_URL = "http://localhost:3000";

function normalizeUrl(candidate: string) {
  const trimmed = candidate.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")
        ? `http://${trimmed}`
        : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export function getAppUrl() {
  const vercelEnv = process.env.VERCEL_ENV;

  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    vercelEnv === "preview" ? process.env.NEXT_PUBLIC_VERCEL_URL : undefined,
    vercelEnv === "preview" ? process.env.VERCEL_URL : undefined,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
    LOCAL_APP_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = normalizeUrl(candidate);

    if (normalized) {
      return normalized;
    }
  }

  return LOCAL_APP_URL;
}
