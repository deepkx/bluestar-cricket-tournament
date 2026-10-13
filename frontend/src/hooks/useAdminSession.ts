import { useEffect, useState } from 'react';
import { getAdminSession } from '../data/auth';
import { requireSupabase, supabaseConfigured } from '../lib/supabase';

/** True when Supabase auth has an active session (admin signed in). */
export function useAdminSession(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      setIsAdmin(false);
      return;
    }
    const sb = requireSupabase();
    void getAdminSession().then((session) => setIsAdmin(Boolean(session)));
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return isAdmin;
}
