import { requireSupabase } from '../lib/supabase';

export const POOL_CODES = ['A', 'B', 'C', 'D'] as const;
export type PoolCode = (typeof POOL_CODES)[number];
export const POOL_SLOT_COUNT = 10;

export type PoolSlot = {
  slotOrder: number;
  teamId: string | null;
  teamName: string | null;
};

export type PoolBoard = {
  poolCode: PoolCode;
  slots: PoolSlot[];
};

export type FixtureRow = {
  id: string;
  poolCode: PoolCode | null;
  matchOrder: number;
  label: string | null;
  teamAId: string | null;
  teamBId: string | null;
  teamAName: string | null;
  teamBName: string | null;
  scheduledAt: string | null;
  venue: string | null;
};

export type TeamPick = { id: string; name: string };

function emptyPoolBoard(): PoolBoard[] {
  return POOL_CODES.map((poolCode) => ({
    poolCode,
    slots: Array.from({ length: POOL_SLOT_COUNT }, (_, i) => ({
      slotOrder: i + 1,
      teamId: null,
      teamName: null,
    })),
  }));
}

export async function adminListTeamsForPools(): Promise<TeamPick[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('teams')
    .select('id, team_name')
    .eq('status', 'confirmed')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('team_name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id as string, name: r.team_name as string }));
}

export async function adminLoadPoolBoard(): Promise<PoolBoard[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('tournament_pool_slots').select('pool_code, slot_order, team_id');
  if (error) throw error;
  const teams = await adminListTeamsForPools();
  const byId = new Map(teams.map((t) => [t.id, t.name]));
  const boards = emptyPoolBoard();
  for (const row of data ?? []) {
    const pool = boards.find((b) => b.poolCode === row.pool_code);
    if (!pool) continue;
    const slot = pool.slots.find((s) => s.slotOrder === row.slot_order);
    if (!slot) continue;
    const tid = row.team_id as string | null;
    slot.teamId = tid;
    slot.teamName = tid ? (byId.get(tid) ?? null) : null;
  }
  return boards;
}

export async function adminSavePoolBoard(boards: PoolBoard[]) {
  const sb = requireSupabase();
  const rows: { pool_code: string; slot_order: number; team_id: string | null }[] = [];
  const used = new Set<string>();
  for (const board of boards) {
    for (const slot of board.slots) {
      if (slot.teamId) {
        if (used.has(slot.teamId)) {
          throw new Error('Each team can only appear in one pool slot.');
        }
        used.add(slot.teamId);
      }
      rows.push({
        pool_code: board.poolCode,
        slot_order: slot.slotOrder,
        team_id: slot.teamId,
      });
    }
  }
  const { error: delErr } = await sb.from('tournament_pool_slots').delete().neq('pool_code', '');
  if (delErr) throw delErr;
  if (rows.length > 0) {
    const { error: insErr } = await sb.from('tournament_pool_slots').insert(rows);
    if (insErr) throw insErr;
  }
}

export async function adminLoadFixtures(): Promise<FixtureRow[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('tournament_fixtures')
    .select('id, pool_code, match_order, label, team_a_id, team_b_id, scheduled_at, venue')
    .order('match_order', { ascending: true })
    .order('pool_code', { ascending: true });
  if (error) throw error;
  const teams = await adminListTeamsForPools();
  const byId = new Map(teams.map((t) => [t.id, t.name]));
  return (data ?? []).map((r) => ({
    id: r.id as string,
    poolCode: (r.pool_code as PoolCode | null) ?? null,
    matchOrder: r.match_order as number,
    label: (r.label as string | null) ?? null,
    teamAId: r.team_a_id as string | null,
    teamBId: r.team_b_id as string | null,
    teamAName: r.team_a_id ? (byId.get(r.team_a_id as string) ?? null) : null,
    teamBName: r.team_b_id ? (byId.get(r.team_b_id as string) ?? null) : null,
    scheduledAt: r.scheduled_at as string | null,
    venue: (r.venue as string | null) ?? null,
  }));
}

export async function adminSaveFixtures(fixtures: FixtureRow[]) {
  const sb = requireSupabase();
  const { data: existing, error: listErr } = await sb.from('tournament_fixtures').select('id');
  if (listErr) throw listErr;
  if (existing && existing.length > 0) {
    const { error: delErr } = await sb.from('tournament_fixtures').delete().in(
      'id',
      existing.map((r) => r.id as string),
    );
    if (delErr) throw delErr;
  }
  if (fixtures.length === 0) return;
  const payload = fixtures.map((f, i) => ({
    pool_code: f.poolCode,
    match_order: f.matchOrder ?? i + 1,
    label: f.label,
    team_a_id: f.teamAId,
    team_b_id: f.teamBId,
    scheduled_at: f.scheduledAt,
    venue: f.venue,
  }));
  const { error } = await sb.from('tournament_fixtures').insert(payload);
  if (error) throw error;
}

/** Generate first pool-round pairings: 1v2, 3v4, … per pool. */
export function buildDefaultPoolFixtures(boards: PoolBoard[]): Omit<FixtureRow, 'id'>[] {
  const out: Omit<FixtureRow, 'id'>[] = [];
  let order = 0;
  for (const board of boards) {
    const filled = board.slots.filter((s) => s.teamId);
    for (let i = 0; i + 1 < filled.length; i += 2) {
      const a = filled[i];
      const b = filled[i + 1];
      if (!a.teamId || !b.teamId) continue;
      order += 1;
      out.push({
        poolCode: board.poolCode,
        matchOrder: order,
        label: `Pool ${board.poolCode}`,
        teamAId: a.teamId,
        teamBId: b.teamId,
        teamAName: a.teamName,
        teamBName: b.teamName,
        scheduledAt: null,
        venue: null,
      });
    }
  }
  return out;
}

export async function fetchPublicPools(): Promise<PoolBoard[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc('get_public_pools');
  if (error) throw error;
  const raw = (data ?? []) as {
    poolCode: PoolCode;
    slots: { slotOrder: number; teamId: string | null; teamName: string | null }[];
  }[];
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const byCode = new Map<PoolCode, PoolBoard>();
  for (const p of raw) {
    if (!POOL_CODES.includes(p.poolCode)) continue;
    byCode.set(p.poolCode, {
      poolCode: p.poolCode,
      slots: (p.slots ?? []).map((s) => ({
        slotOrder: s.slotOrder,
        teamId: s.teamId,
        teamName: s.teamName,
      })),
    });
  }
  return POOL_CODES.map((code) => byCode.get(code) ?? emptyPoolBoard().find((b) => b.poolCode === code)!);
}

export async function fetchPublicFixtures(): Promise<FixtureRow[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc('get_public_fixtures');
  if (error) throw error;
  const raw = (data ?? []) as {
    id: string;
    poolCode: PoolCode | null;
    matchOrder: number;
    label: string | null;
    teamAName: string | null;
    teamBName: string | null;
    scheduledAt: string | null;
    venue: string | null;
  }[];
  if (!Array.isArray(raw)) return [];
  return raw.map((f) => ({
    id: f.id,
    poolCode: f.poolCode,
    matchOrder: f.matchOrder,
    label: f.label,
    teamAId: null,
    teamBId: null,
    teamAName: f.teamAName,
    teamBName: f.teamBName,
    scheduledAt: f.scheduledAt,
    venue: f.venue,
  }));
}
