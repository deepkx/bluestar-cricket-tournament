import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { apiErrorMessage } from '../../api/client';
import { AdminShell } from '../../components/admin/AdminShell';
import type { TournamentPublic } from '../../types/api';
import {
  registrationModeFromSettings,
  type RegistrationMode,
  type TournamentSettings,
} from '../../types/adminSettings';
import { datetimeLocalInputToInstant, instantToDatetimeLocalInput } from '../../utils/adminDateTime';
import { formatRegisteredAt } from '../../utils/formatDateTime';

type FormState = {
  tournamentName: string;
  description: string;
  entryFeeRupee: number;
  maxTeams: number;
  minSquadSize: number;
  maxSquadSize: number;
  registrationMode: RegistrationMode;
  registrationOpensLocal: string;
  registrationClosesLocal: string;
  tournamentStartsLocal: string;
  fixtureAnnouncementLocal: string;
  fixturesPublished: boolean;
  timezone: string;
  venue: string;
  rules: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
};

function settingsToForm(s: TournamentSettings): FormState {
  const tz = s.timezone || 'Asia/Kolkata';
  return {
    tournamentName: s.name ?? '',
    description: s.description ?? '',
    entryFeeRupee: Math.round(s.entryFeePaise / 100),
    maxTeams: s.maxTeams,
    minSquadSize: s.minSquadSize,
    maxSquadSize: s.maxSquadSize,
    registrationMode: registrationModeFromSettings(s),
    registrationOpensLocal: instantToDatetimeLocalInput(s.registrationOpensAt, tz),
    registrationClosesLocal: instantToDatetimeLocalInput(s.registrationClosesAt, tz),
    tournamentStartsLocal: instantToDatetimeLocalInput(s.tournamentStartsAt, tz),
    fixtureAnnouncementLocal: instantToDatetimeLocalInput(s.fixtureAnnouncementAt, tz),
    fixturesPublished: s.fixturesPublished,
    timezone: tz,
    venue: s.venue ?? '',
    rules: s.rules ?? '',
    contactEmail: s.contactEmail ?? '',
    contactPhone: s.contactPhone ?? '',
    contactAddress: s.contactAddress ?? '',
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="register-panel px-5 py-6 sm:px-7">
      <h2 className="hud-label border-b border-paper/10 pb-3 text-floodlight-dim">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function AdminSettingsPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [live, setLive] = useState<TournamentPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [settingsRes, publicRes] = await Promise.all([
        api.get<TournamentSettings>('/api/v1/admin/tournament/settings'),
        api.get<TournamentPublic>('/api/v1/tournaments/current'),
      ]);
      setForm(settingsToForm(settingsRes.data));
      setLive(publicRes.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load settings. Sign in again from Admin in the header.'));
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSavedAt(null);
  }

  const registrationStatusLabel = useMemo(() => {
    if (!live) return '—';
    return live.registrationOpen ? 'Open for new teams' : 'Closed';
  }, [live]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (form.minSquadSize > form.maxSquadSize) {
      setError('Minimum squad cannot be greater than maximum squad.');
      return;
    }
    setSaving(true);
    setError('');
    const tz = form.timezone.trim() || 'Asia/Kolkata';
    try {
      const { data } = await api.patch<TournamentSettings>('/api/v1/admin/tournament/settings', {
        name: form.tournamentName.trim(),
        description: form.description.trim() || null,
        entryFeePaise: Math.max(0, Math.round(form.entryFeeRupee * 100)),
        maxTeams: form.maxTeams,
        minSquadSize: form.minSquadSize,
        maxSquadSize: form.maxSquadSize,
        registrationMode: form.registrationMode,
        registrationOpensAt: datetimeLocalInputToInstant(form.registrationOpensLocal, tz),
        registrationOpensAtClear: !form.registrationOpensLocal.trim(),
        registrationClosesAt: datetimeLocalInputToInstant(form.registrationClosesLocal, tz),
        registrationClosesAtClear: !form.registrationClosesLocal.trim(),
        tournamentStartsAt: datetimeLocalInputToInstant(form.tournamentStartsLocal, tz),
        tournamentStartsAtClear: !form.tournamentStartsLocal.trim(),
        fixtureAnnouncementAt: datetimeLocalInputToInstant(form.fixtureAnnouncementLocal, tz),
        fixtureAnnouncementAtClear: !form.fixtureAnnouncementLocal.trim(),
        fixturesPublished: form.fixturesPublished,
        timezone: tz,
        venue: form.venue.trim() || null,
        rules: form.rules.trim() || null,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
        contactAddress: form.contactAddress.trim() || null,
      });
      setForm(settingsToForm(data));
      const publicRes = await api.get<TournamentPublic>('/api/v1/tournaments/current');
      setLive(publicRes.data);
      setSavedAt(Date.now());
    } catch (err) {
      setError(apiErrorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Tournament settings">
      {loading ? (
        <p className="text-paper/50">Loading settings…</p>
      ) : !form ? (
        <div className="register-panel px-5 py-8 text-center">
          <p className="text-red-300">{error || 'Settings unavailable.'}</p>
          <button type="button" className="btn-outline mt-4 text-sm" onClick={load}>
            Retry
          </button>
        </div>
      ) : (
        <form onSubmit={save} className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-paper/15 bg-turf/25 px-5 py-4">
            <div>
              <p className="hud-label text-paper/45">Live registration status</p>
              <p className="mt-1 font-display text-lg text-floodlight-bright">{registrationStatusLabel}</p>
            </div>
            {live?.registrationTestMode ? (
              <span className="border border-amber-500/40 bg-amber-950/40 px-3 py-1 text-xs text-amber-100">
                Test mode (min squad 2)
              </span>
            ) : null}
          </div>

          {error ? (
            <p className="border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}
          {savedAt ? (
            <p className="border border-floodlight/30 bg-floodlight/10 px-4 py-3 text-sm text-floodlight-bright">
              Saved · registration status updated on the public site.
            </p>
          ) : null}

          <Section title="Registration">
            <fieldset className="space-y-3">
              <legend className="form-label">Who can register</legend>
              {(
                [
                  ['SCHEDULE', 'Use open / close dates below'],
                  ['FORCE_OPEN', 'Always open (ignore dates)'],
                  ['FORCE_CLOSED', 'Always closed'],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-start gap-3 text-sm text-paper/85">
                  <input
                    type="radio"
                    name="registrationMode"
                    className="mt-1 accent-floodlight"
                    checked={form.registrationMode === value}
                    onChange={() => patch('registrationMode', value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <p className="text-xs text-paper/45">
              Times use timezone <span className="font-mono text-paper/60">{form.timezone}</span> (change below).
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="form-label">Registration opens</span>
                <input
                  type="datetime-local"
                  className="form-field"
                  value={form.registrationOpensLocal}
                  onChange={(e) => patch('registrationOpensLocal', e.target.value)}
                  disabled={form.registrationMode !== 'SCHEDULE'}
                />
              </label>
              <label className="block">
                <span className="form-label">Registration closes</span>
                <input
                  type="datetime-local"
                  className="form-field"
                  value={form.registrationClosesLocal}
                  onChange={(e) => patch('registrationClosesLocal', e.target.value)}
                  disabled={form.registrationMode !== 'SCHEDULE'}
                />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="block">
                <span className="form-label">Max teams</span>
                <input
                  type="number"
                  min={2}
                  max={128}
                  className="form-field"
                  value={form.maxTeams}
                  onChange={(e) => patch('maxTeams', Number(e.target.value))}
                />
              </label>
              <label className="block">
                <span className="form-label">Min squad</span>
                <input
                  type="number"
                  min={2}
                  max={15}
                  className="form-field"
                  value={form.minSquadSize}
                  onChange={(e) => patch('minSquadSize', Number(e.target.value))}
                />
              </label>
              <label className="block">
                <span className="form-label">Max squad</span>
                <input
                  type="number"
                  min={2}
                  max={15}
                  className="form-field"
                  value={form.maxSquadSize}
                  onChange={(e) => patch('maxSquadSize', Number(e.target.value))}
                />
              </label>
            </div>
            <label className="block">
              <span className="form-label">Entry fee (₹)</span>
              <input
                type="number"
                min={0}
                className="form-field sm:max-w-xs"
                value={form.entryFeeRupee}
                onChange={(e) => patch('entryFeeRupee', Number(e.target.value))}
              />
            </label>
          </Section>

          <Section title="Schedule & fixtures">
            <label className="block">
              <span className="form-label">Tournament start (homepage countdown)</span>
              <input
                type="datetime-local"
                className="form-field"
                value={form.tournamentStartsLocal}
                onChange={(e) => patch('tournamentStartsLocal', e.target.value)}
              />
              {form.tournamentStartsLocal ? (
                <span className="mt-1 block text-xs text-paper/45">
                  Preview: {formatRegisteredAt(datetimeLocalInputToInstant(form.tournamentStartsLocal, form.timezone), form.timezone)}
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="form-label">Pools / fixtures reveal</span>
              <input
                type="datetime-local"
                className="form-field"
                value={form.fixtureAnnouncementLocal}
                onChange={(e) => patch('fixtureAnnouncementLocal', e.target.value)}
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-paper/85">
              <input
                type="checkbox"
                className="h-4 w-4 accent-floodlight"
                checked={form.fixturesPublished}
                onChange={(e) => patch('fixturesPublished', e.target.checked)}
              />
              Fixtures visible on the public Fixtures page
            </label>
          </Section>

          <Section title="Venue & contact">
            <label className="block">
              <span className="form-label">Timezone (IANA)</span>
              <input
                className="form-field font-mono text-sm"
                value={form.timezone}
                onChange={(e) => patch('timezone', e.target.value)}
                placeholder="Asia/Kolkata"
              />
            </label>
            <label className="block">
              <span className="form-label">Venue name</span>
              <input className="form-field" value={form.venue} onChange={(e) => patch('venue', e.target.value)} />
            </label>
            <label className="block">
              <span className="form-label">Contact email</span>
              <input
                type="email"
                className="form-field"
                value={form.contactEmail}
                onChange={(e) => patch('contactEmail', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="form-label">Contact phone</span>
              <input className="form-field" value={form.contactPhone} onChange={(e) => patch('contactPhone', e.target.value)} />
            </label>
            <label className="block">
              <span className="form-label">Maps link or address</span>
              <input
                className="form-field"
                value={form.contactAddress}
                onChange={(e) => patch('contactAddress', e.target.value)}
              />
            </label>
          </Section>

          <Section title="About (optional)">
            <label className="block">
              <span className="form-label">Tournament name</span>
              <input className="form-field" value={form.tournamentName} onChange={(e) => patch('tournamentName', e.target.value)} />
            </label>
            <label className="block">
              <span className="form-label">Short description</span>
              <textarea
                className="form-field min-h-[5rem]"
                value={form.description}
                onChange={(e) => patch('description', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="form-label">Rules (shown where linked from site)</span>
              <textarea
                className="form-field min-h-[8rem] font-mono text-sm"
                value={form.rules}
                onChange={(e) => patch('rules', e.target.value)}
              />
            </label>
          </Section>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary text-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
            <button type="button" className="btn-outline text-sm" disabled={saving} onClick={load}>
              Reset changes
            </button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
