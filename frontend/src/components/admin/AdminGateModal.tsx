import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authErrorMessage, getAdminEmail, signInAdmin } from '../../data/auth';
import { supabaseConfigured } from '../../lib/supabase';

const EMAIL_HINT_KEY = 'admin_email_hint';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AdminGateModal({ open, onClose, onSuccess }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(getAdminEmail());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const hint = localStorage.getItem(EMAIL_HINT_KEY);
    setEmail(hint?.trim() || getAdminEmail());
    setError('');
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!supabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY on Vercel, then redeploy.');
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter the admin email from Supabase Authentication → Users.');
      return;
    }
    setLoading(true);
    try {
      await signInAdmin(trimmedEmail, password);
      localStorage.setItem(EMAIL_HINT_KEY, trimmedEmail);
      setPassword('');
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
        navigate('/admin/teams');
      }
    } catch (err) {
      setError(authErrorMessage(err, 'Could not sign in'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4" role="dialog" aria-modal>
      <form
        onSubmit={submit}
        className="register-panel w-full max-w-sm px-6 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl tracking-wide text-floodlight-bright">Admin access</h2>
        <p className="mt-2 text-sm text-paper/60">
          Sign in with the user you created in Supabase (Authentication → Users). Default email:{' '}
          {getAdminEmail()}.
        </p>
        <label className="mt-5 block">
          <span className="form-label">Email</span>
          <input
            type="email"
            className="form-field"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mt-3 block">
          <span className="form-label">Password</span>
          <input
            type="password"
            className="form-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" className="btn-outline flex-1 text-center text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 text-sm"
            disabled={loading || !password || !email.trim()}
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </div>
      </form>
    </div>
  );
}
