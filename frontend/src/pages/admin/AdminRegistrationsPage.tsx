import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../api/client';
import { AdminShell } from '../../components/admin/AdminShell';

type Row = { id: number; publicReference: string; teamName: string; status: string };

export function AdminRegistrationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/v1/admin/registrations', { params: { size: 100 } })
      .then((r) => setRows(r.data.content ?? r.data))
      .catch((err) => setError(apiErrorMessage(err, 'Could not load registrations')));
  }, []);

  const exportCsv = async () => {
    try {
      const { data } = await api.get<string>('/api/v1/admin/registrations/export.csv', {
        responseType: 'text',
      });
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'registrations.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(apiErrorMessage(err, 'Export failed'));
    }
  };

  return (
    <AdminShell title="Registrations">
      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}
      <button type="button" className="btn-outline text-sm" onClick={exportCsv}>
        Download CSV
      </button>
      <div className="register-panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-paper/12 text-xs uppercase tracking-widest text-paper/45">
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-paper/8">
                <td className="px-4 py-3 font-mono text-paper/70">{r.publicReference}</td>
                <td className="px-4 py-3 text-paper">{r.teamName}</td>
                <td className="px-4 py-3 text-paper/65">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="px-4 py-8 text-center text-paper/45">No registrations yet.</p> : null}
      </div>
    </AdminShell>
  );
}
