/**
 * Public (browser-safe) environment validation.
 * Every integration is optional: when its variables are missing the app runs
 * in an honest demo mode for that feature instead of pretending it works.
 * Server-only secrets live in env.server.ts and never reach the browser.
 * (Validated by hand rather than with Zod so this module stays tiny in browser bundles.)
 */
export interface PublicEnv {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

const clean = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const env: PublicEnv = {
    NEXT_PUBLIC_SITE_URL: clean(source.NEXT_PUBLIC_SITE_URL),
    NEXT_PUBLIC_SUPABASE_URL: clean(source.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: clean(source.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
  const problems: string[] = [];
  for (const key of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL"] as const) {
    if (env[key] && !isHttpUrl(env[key]!)) problems.push(`${key}: must be a valid http(s) URL`);
  }
  if (Boolean(env.NEXT_PUBLIC_SUPABASE_URL) !== Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    problems.push("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set together");
  }
  if (problems.length > 0) throw new Error(`Invalid public environment: ${problems.join("; ")}`);
  return env;
}

// NEXT_PUBLIC_ values must be referenced literally so the bundler can inline them.
export const publicEnv: PublicEnv = parsePublicEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const supabaseConfigured = Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
