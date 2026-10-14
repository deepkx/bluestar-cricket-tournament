import { useEffect, useMemo, useRef, useState } from 'react';
import { apiErrorMessage } from '../../utils/errors';
import { PlayerPhotoField } from '../register/PlayerPhotoField';
import {
  grantCaptainUpload,
  saveCaptainRoster,
  type CaptainPlayerDraft,
} from '../../data/captainRoster';
import { getCurrentTournament } from '../../data/tournament';
import type { TeamDetail } from '../../data/teams';
import { mediaUrl } from '../../utils/mediaUrl';
import {
  countDraftNamed,
  countDraftPhotos,
  playerHasPhoto,
} from '../../utils/squadProgress';

type Props = {
  teamId: string;
  detail: TeamDetail;
  onSaved: () => void;
  onCancel: () => void;
};

function draftsFromDetail(detail: TeamDetail): CaptainPlayerDraft[] {
  if (detail.players.length === 0) {
    return [{ id: null, fullName: '', photo: null, existingPhotoPath: null }];
  }
  return detail.players.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    photo: null,
    existingPhotoPath: p.photoUrl,
  }));
}

export function CaptainRosterPanel({ teamId, detail, onSaved, onCancel }: Props) {
  const isEdit = detail.players.length > 0;
  const [minSquad, setMinSquad] = useState(11);
  const [maxSquad, setMaxSquad] = useState(18);
  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const [players, setPlayers] = useState<CaptainPlayerDraft[]>(() => draftsFromDetail(detail));
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [squadSize, setSquadSize] = useState(Math.max(detail.players.length, 11));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const namedCount = useMemo(() => countDraftNamed(players), [players]);
  const photoCount = useMemo(() => countDraftPhotos(players), [players]);

  useEffect(() => {
    getCurrentTournament()
      .then((t) => {
        setMinSquad(t.minSquadSize);
        setMaxSquad(t.maxSquadSize);
        setSquadSize((prev) => {
          const base = Math.max(detail.players.length, t.minSquadSize);
          return Math.min(Math.max(prev, base), t.maxSquadSize);
        });
      })
      .catch(() => {});
  }, [detail.players.length]);

  useEffect(() => {
    setPlayers((prev) => {
      if (prev.length === squadSize) return prev;
      if (prev.length < squadSize) {
        const next = [...prev];
        while (next.length < squadSize) {
          next.push({ id: null, fullName: '', photo: null, existingPhotoPath: null });
        }
        return next;
      }
      const dropped = prev.slice(squadSize).filter((p) => p.id).map((p) => p.id!);
      if (dropped.length > 0) {
        setRemovedIds((r) => [...r, ...dropped]);
      }
      return prev.slice(0, squadSize);
    });
  }, [squadSize]);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [error]);

  const updatePlayer = (i: number, patch: Partial<CaptainPlayerDraft>) => {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };

  const validate = (): string | null => {
    if (!teamLogo && !detail.logoUrl) return 'Upload a team logo.';
    for (let i = 0; i < players.length; i++) {
      if (!players[i].fullName.trim()) return `Enter the name for player ${i + 1}.`;
      const hasPhoto = players[i].photo || players[i].existingPhotoPath;
      if (!hasPhoto) return `Upload a photo for player ${i + 1}.`;
    }
    if (players.length < minSquad) return `Add at least ${minSquad} players.`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await saveCaptainRoster(teamId, teamLogo, players, removedIds);
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save squad. Try verifying again if your session expired.'));
    } finally {
      setSubmitting(false);
    }
  };

  const photosComplete = photoCount >= squadSize && namedCount >= squadSize;

  return (
    <form className="mt-10 border-t border-paper/12 pt-8" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="hud-label text-floodlight-dim">{isEdit ? 'Edit squad' : 'Add squad'}</h3>
        <button type="button" className="text-sm text-paper/55 underline" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="mt-4 rounded-md border border-paper/12 bg-turf/20 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-paper">
            Progress{' '}
            <span className={`tabular-nums ${photosComplete ? 'text-floodlight-bright' : 'text-amber-200/90'}`}>
              {photoCount}/{squadSize}
            </span>{' '}
            <span className="font-normal text-paper/50">photos</span>
          </p>
          <p className="text-xs tabular-nums text-paper/45">
            Names {namedCount}/{squadSize}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-deep/60">
          <div
            className={`h-full transition-all ${photosComplete ? 'bg-floodlight' : 'bg-floodlight/70'}`}
            style={{ width: `${Math.min(100, squadSize > 0 ? (photoCount / squadSize) * 100 : 0)}%` }}
          />
        </div>
        {!photosComplete ? (
          <p className="mt-2 text-xs text-paper/50">Each listed player needs a photo before you submit.</p>
        ) : null}
      </div>

      {error ? (
        <p ref={errorRef} className="mt-4 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <label className="mt-6 block">
        <span className="form-label">Team logo</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="form-field py-2 file:mr-3 file:border-0 file:bg-floodlight file:px-3 file:py-1 file:text-sm file:font-semibold file:text-black"
          onChange={(e) => setTeamLogo(e.target.files?.[0] ?? null)}
        />
        {detail.logoUrl && !teamLogo ? (
          <p className="mt-1 text-xs text-paper/45">Current logo on file — upload only if replacing.</p>
        ) : null}
      </label>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="form-label">Squad size ({minSquad}–{maxSquad})</span>
          <input
            type="number"
            min={minSquad}
            max={maxSquad}
            value={squadSize}
            onChange={(e) => setSquadSize(Number(e.target.value))}
            className="form-field w-24"
          />
        </label>
      </div>

      <ul className="mt-8 space-y-6">
        {players.map((p, i) => {
          const hasPhoto = playerHasPhoto(p);
          const hasName = Boolean(p.fullName.trim());
          return (
            <li
              key={p.id ?? `new-${i}`}
              className={`border px-4 py-4 ${
                hasName && !hasPhoto
                  ? 'border-amber-500/35 bg-amber-500/[0.06]'
                  : 'border-paper/10 bg-ink-deep/30'
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-widest text-paper/45">
                  {i === 0 ? 'Captain' : `Player ${i + 1}`}
                </p>
                {hasName ? (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      hasPhoto ? 'text-floodlight-dim' : 'text-amber-200/90'
                    }`}
                  >
                    {hasPhoto ? 'Photo ✓' : 'Photo needed'}
                  </span>
                ) : null}
              </div>
              <label className="mb-4 block">
                <span className="form-label">Full name</span>
                <input
                  type="text"
                  value={p.fullName}
                  onChange={(e) => updatePlayer(i, { fullName: e.target.value })}
                  className="form-field"
                  autoComplete="name"
                />
              </label>
              <PlayerPhotoField
                label="Player photo"
                file={p.photo}
                existingUrl={mediaUrl(p.existingPhotoPath)}
                onChange={(f) => updatePlayer(i, { photo: f })}
                onClearExisting={
                  p.existingPhotoPath
                    ? () => updatePlayer(i, { existingPhotoPath: null, photo: null })
                    : undefined
                }
              />
            </li>
          );
        })}
      </ul>

      <button type="submit" disabled={submitting} className="btn-primary mt-8 w-full sm:w-auto">
        {submitting ? 'Saving…' : isEdit ? 'Save squad changes' : 'Submit squad'}
      </button>
    </form>
  );
}

type VerifyProps = {
  teamId: string;
  onVerified: () => void;
  onCancel: () => void;
};

export function CaptainVerifyDialog({ teamId, onVerified, onCancel }: VerifyProps) {
  const [last4, setLast4] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(last4)) {
      setError('Enter exactly 4 digits from the captain’s registered mobile number.');
      return;
    }
    setChecking(true);
    setError('');
    try {
      const ok = await grantCaptainUpload(teamId, last4);
      if (!ok) {
        setError('Incorrect digits. Use the last 4 digits of the captain number on file.');
        return;
      }
      onVerified();
    } catch (err) {
      setError(apiErrorMessage(err, 'Verification failed.'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
      <form className="register-panel w-full max-w-sm px-6 py-8" onSubmit={submit}>
        <h3 className="font-display text-xl text-floodlight-bright">Captain verification</h3>
        <p className="mt-2 text-sm text-paper/60">
          Enter the last 4 digits of your registered captain mobile number to add or update squad photos.
        </p>
        <label className="mt-6 block">
          <span className="form-label">Last 4 digits</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            pattern="\d{4}"
            value={last4}
            onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="form-field text-center text-lg tracking-[0.4em]"
            autoComplete="one-time-code"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="submit" disabled={checking} className="btn-primary flex-1">
            {checking ? 'Checking…' : 'Continue'}
          </button>
          <button type="button" className="btn-outline flex-1" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
