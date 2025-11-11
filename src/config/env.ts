function getEnvVar(key: string, required = true): string | undefined {
  const value = process.env[key];
  if (required && (!value || value.length === 0)) {
    throw new Error(`Variável de ambiente ausente: ${key}`);
  }
  return value;
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const SUPABASE_SERVICE_ROLE_KEY = getEnvVar(
  "SUPABASE_SERVICE_ROLE_KEY",
  false,
);

const ownerEmails = getEnvVar("OWNER_EMAILS", false);
export const OWNER_EMAILS = ownerEmails
  ? ownerEmails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  : [];

export const SITE_URL = getEnvVar("NEXT_PUBLIC_SITE_URL", false);
export const RESEND_API_KEY = getEnvVar("RESEND_API_KEY", false);
export const INVITATION_EMAIL_FROM = getEnvVar("INVITATION_EMAIL_FROM", false);

export function getSiteUrl(fallback: string): string {
  return SITE_URL ?? fallback;
}
