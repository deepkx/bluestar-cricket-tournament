import { requireSupabase } from '../lib/supabase';

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim() || 'admin@bluestar.local';

export function getAdminEmail() {
  return adminEmail;
}

export async function signInAdmin(email: string, password: string) {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signInAdminWithPasswordOnly(password: string) {
  return signInAdmin(adminEmail, password);
}

export async function getAdminSession() {
  const sb = requireSupabase();
  const { data } = await sb.auth.getSession();
  return data.session;
}

export async function signOutAdmin() {
  const sb = requireSupabase();
  await sb.auth.signOut();
}

export function authErrorMessage(err: unknown, fallback: string): string {
  const msg = (err as { message?: string })?.message ?? '';
  if (msg.includes('Invalid login credentials')) {
    return 'Wrong email or password. In Supabase → Authentication → Users, add a user with this email and your password (e.g. 0908).';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Confirm the admin email in Supabase, or disable “Confirm email” under Authentication → Providers → Email.';
  }
  if (msg.includes('Invalid API key') || msg.includes('api key')) {
    return 'Invalid Supabase key on Vercel. Use the anon public key (eyJ…) from Project Settings → API, not the service role key.';
  }
  if (msg) return msg;
  return fallback;
}
