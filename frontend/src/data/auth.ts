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
  const msg = (err as { message?: string })?.message;
  if (msg?.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (msg) return msg;
  return fallback;
}
