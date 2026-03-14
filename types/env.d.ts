declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?: string;
    NEXT_PUBLIC_VERCEL_URL?: string;
    VERCEL_ENV?: "development" | "preview" | "production";
    VERCEL_PROJECT_PRODUCTION_URL?: string;
    VERCEL_URL?: string;
  }
}
