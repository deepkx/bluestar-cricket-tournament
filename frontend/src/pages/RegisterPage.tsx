import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../utils/errors';
import { PublicPageContent } from '../components/layout/PublicPageContent';
import { PublicPageHero } from '../components/layout/PublicPageHero';
import { PlayerPhotoField } from '../components/register/PlayerPhotoField';
import { submitRegistration } from '../data/registrations';
import { getCurrentTournament } from '../data/tournament';
import type { TournamentPublic } from '../types/api';

type SquadMember = {
  fullName: string;
  photo: File | null;
};

function emptyMember(): SquadMember {
  return { fullName: '', photo: null };
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="hud-label mt-10 border-b border-paper/10 pb-3 text-floodlight-dim first:mt-8">{children}</h2>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const [squadSize, setSquadSize] = useState(11);
  const [captainName, setCaptainName] = useState('');
  const [captainPhoto, setCaptainPhoto] = useState<File | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<SquadMember[]>([]);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const errorBannerRef = useRef<HTMLParagraphElement>(null);

  const minSquad = tournament?.minSquadSize ?? 11;
  const maxSquad = tournament?.maxSquadSize ?? 15;

  useEffect(() => {
    getCurrentTournament()
      .then((t) => {
        setTournament(t);
        setSquadSize((prev) => Math.max(t.minSquadSize, Math.min(prev, t.maxSquadSize)));
      })
      .catch(() => setError('Could not load registration settings.'));
  }, []);

  useEffect(() => {
    const others = Math.max(0, squadSize - 1);
    setOtherPlayers((prev) => {
      const next = [...prev];
      while (next.length < others) next.push(emptyMember());
      while (next.length > others) next.pop();
      return next;
    });
  }, [squadSize]);

  useEffect(() => {
    if (error) {
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [error]);

  const updateOther = (i: number, patch: Partial<SquadMember>) => {
    setOtherPlayers((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };

  const showError = (msg: string) => {
    setError(msg);
    requestAnimationFrame(() => {
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const validate = (): string | null => {
    if (!teamName.trim()) return 'Enter your team name.';
    if (!teamLogo) return 'Upload a team logo.';
    if (!captainName.trim()) return 'Enter the captain’s name.';
    if (!captainPhoto) return 'Upload the captain’s photo.';
    for (let i = 0; i < otherPlayers.length; i++) {
      if (!otherPlayers[i].fullName.trim()) return `Enter the name for player ${i + 2}.`;
      if (!otherPlayers[i].photo) return `Upload a photo for player ${i + 2}.`;
    }
    if (!rulesAccepted) return 'Accept the tournament rules to continue.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      showError(validationError);
      return;
    }
    if (!teamLogo || !captainPhoto) return;

    setError('');
    setSubmitting(true);
    try {
      const players = [
        { fullName: captainName.trim(), isCaptain: true },
        ...otherPlayers.map((p) => ({
          fullName: p.fullName.trim(),
          isCaptain: false,
        })),
      ];
      const playerPhotos = [captainPhoto, ...otherPlayers.map((p) => p.photo!)];

      const { publicReference } = await submitRegistration({
        teamName: teamName.trim(),
        captainName: captainName.trim(),
        players,
        teamLogo,
        playerPhotos,
      });
      navigate(`/registration/success?ref=${publicReference}`);
    } catch (err: unknown) {
      showError(apiErrorMessage(err, 'Registration failed. Check your connection and try again.'));
      setSubmitting(false);
    }
  };

  if (!tournament) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-ink-deep text-paper/40">Loading…</div>
    );
  }

  if (!tournament.registrationOpen) {
    return (
      <div className="bg-ink-deep pb-20">
        <PublicPageHero kicker="Register" title="Registration closed" sideScenery />
        <PublicPageContent width="md" sideScenery>
          <div className="register-panel px-6 py-10 text-center sm:px-10">
            <p className="text-paper/75">
              Team registration is not open right now. Check back later or contact the tournament committee.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/" className="btn-outline text-center text-sm">
                Home
              </Link>
              <Link to="/about" className="btn-primary text-center text-sm">
                Rules
              </Link>
            </div>
          </div>
        </PublicPageContent>
      </div>
    );
  }

  return (
    <div className="bg-ink-deep pb-20 md:pb-28">
      <PublicPageHero
        kicker="Register"
        title="Team registration"
        lead={`${minSquad}–${maxSquad} players · submit team details and photos`}
        sideScenery
      />
      <PublicPageContent width="lg" sideScenery>
        <form className="register-panel px-5 py-6 sm:px-8 sm:py-8" onSubmit={handleSubmit}>
          <div className="border border-floodlight/35 bg-floodlight/10 px-4 py-3 text-sm text-paper/90">
            After you submit, an admin will review your team before it appears on the public board. Details and photos
            are <strong className="text-floodlight-bright">final at submit</strong> unless the committee contacts you.
          </div>

          {tournament.registrationTestMode ? (
            <p className="mt-4 border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
              Test mode: minimum squad is {minSquad} players.
            </p>
          ) : null}

          {error ? (
            <p
              ref={errorBannerRef}
              role="alert"
              className="mt-4 border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          ) : null}

          <SectionTitle>Team</SectionTitle>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="form-label">Team name</span>
              <input
                className="form-field"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                autoComplete="organization"
                disabled={submitting}
              />
            </label>
            <PlayerPhotoField label="Team logo" file={teamLogo} onChange={setTeamLogo} />
            <label className="block">
              <span className="form-label">Number of players (including captain)</span>
              <select
                className="form-field"
                value={squadSize}
                onChange={(e) => setSquadSize(Number(e.target.value))}
                disabled={submitting}
              >
                {Array.from({ length: maxSquad - minSquad + 1 }, (_, i) => minSquad + i).map((n) => (
                  <option key={n} value={n}>
                    {n} players
                  </option>
                ))}
              </select>
            </label>
          </div>

          <SectionTitle>Captain (player 1)</SectionTitle>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="form-label">Captain full name</span>
              <input
                className="form-field"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                disabled={submitting}
              />
            </label>
            <PlayerPhotoField label="Captain photo" file={captainPhoto} onChange={setCaptainPhoto} />
          </div>

          {otherPlayers.length > 0 ? (
            <>
              <SectionTitle>Squad — players 2 to {squadSize}</SectionTitle>
              <div className="mt-5 space-y-5">
                {otherPlayers.map((p, i) => (
                  <div key={i} className="border border-paper/10 bg-ink-deep/40 p-4 sm:p-5">
                    <p className="hud-stat mb-3 text-paper/45">Player {i + 2}</p>
                    <label className="block">
                      <span className="form-label">Full name</span>
                      <input
                        className="form-field"
                        value={p.fullName}
                        onChange={(e) => updateOther(i, { fullName: e.target.value })}
                        disabled={submitting}
                      />
                    </label>
                    <div className="mt-4">
                      <PlayerPhotoField
                        label="Player photo"
                        file={p.photo}
                        onChange={(f) => updateOther(i, { photo: f })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <SectionTitle>Confirm</SectionTitle>
          <label className="mt-5 flex items-start gap-3 text-sm text-paper/80">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-floodlight"
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              disabled={submitting}
            />
            <span>
              I accept the{' '}
              <Link to="/about" className="text-floodlight-bright underline">
                tournament rules
              </Link>{' '}
              and confirm all details are final.
            </span>
          </label>

          <div className="mt-8 border-t border-paper/10 pt-6">
            {error ? (
              <p role="alert" className="mb-4 border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn-primary w-full text-sm sm:w-auto" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit registration'}
            </button>
          </div>
        </form>
      </PublicPageContent>
    </div>
  );
}
