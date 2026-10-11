import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { apiErrorMessage, setAdminToken } from '../../api/client';

type Props = {
  open: boolean;
  onClose: () => void;
  /** When set, called instead of navigating to /admin after login. */
  onSuccess?: (token: string) => void;
};

export function AdminGateModal({ open, onClose, onSuccess }: Props) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string }>('/api/v1/admin/auth/quick-login', { password });
      setPassword('');
      if (onSuccess) {
        onSuccess(data.token);
      } else {
        localStorage.setItem('admin_token', data.token);
        setAdminToken(data.token);
        onClose();
        navigate('/admin');
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Incorrect password'));
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
        <p className="mt-2 text-sm text-paper/60">Enter the admin password to continue.</p>
        <input
          type="password"
          className="form-field mt-5"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" className="btn-outline flex-1 text-center text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1 text-sm" disabled={loading || !password}>
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </div>
      </form>
    </div>
  );
}
