import JSZip from 'jszip';

function safeFileName(name: string): string {
  return name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 48) || 'file';
}

async function fetchBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

function extFromBlob(blob: Blob): string {
  if (blob.type.includes('png')) return 'png';
  if (blob.type.includes('webp')) return 'webp';
  return 'jpg';
}

export async function downloadTeamPhotosZip(
  teamName: string,
  logoUrl: string | null,
  players: { fullName: string; photoUrl: string | null }[],
) {
  const zip = new JSZip();
  const folder = zip.folder(safeFileName(teamName)) ?? zip;

  if (logoUrl) {
    const blob = await fetchBlob(logoUrl);
    if (blob) folder.file(`logo.${extFromBlob(blob)}`, blob);
  }

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.photoUrl) continue;
    const blob = await fetchBlob(p.photoUrl);
    if (blob) {
      const label = `${String(i + 1).padStart(2, '0')}-${safeFileName(p.fullName)}.${extFromBlob(blob)}`;
      folder.file(label, blob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bluestar-${safeFileName(teamName)}-photos.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAllTeamsPhotosZip(
  teams: { teamName: string; logoUrl: string | null; players: { fullName: string; photoUrl: string | null }[] }[],
) {
  const zip = new JSZip();
  for (const team of teams) {
    const folder = zip.folder(safeFileName(team.teamName));
    if (!folder) continue;
    if (team.logoUrl) {
      const blob = await fetchBlob(team.logoUrl);
      if (blob) folder.file(`logo.${extFromBlob(blob)}`, blob);
    }
    for (let i = 0; i < team.players.length; i++) {
      const p = team.players[i];
      if (!p.photoUrl) continue;
      const blob = await fetchBlob(p.photoUrl);
      if (blob) {
        folder.file(
          `${String(i + 1).padStart(2, '0')}-${safeFileName(p.fullName)}.${extFromBlob(blob)}`,
          blob,
        );
      }
    }
  }
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Bluestar-all-team-photos.zip';
  a.click();
  URL.revokeObjectURL(url);
}
