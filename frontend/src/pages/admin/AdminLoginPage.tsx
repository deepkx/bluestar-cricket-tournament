import { Navigate } from 'react-router-dom';

/** Legacy URL — admin uses quick-login via AdminShell / header Admin gate. */
export function AdminLoginPage() {
  return <Navigate to="/admin" replace />;
}
