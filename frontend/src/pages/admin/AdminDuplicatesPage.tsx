import { AdminDuplicateNamesSection } from '../../components/admin/AdminDuplicateNamesSection';
import { AdminShell } from '../../components/admin/AdminShell';

export function AdminDuplicatesPage() {
  return (
    <AdminShell title="Duplicate player names">
      <p className="mb-6 text-sm text-paper/60">
        Scan confirmed squads for the same player name on different teams (typos or shared photos).
      </p>
      <AdminDuplicateNamesSection refreshKey={0} />
    </AdminShell>
  );
}
