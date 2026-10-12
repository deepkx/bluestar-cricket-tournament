import fixturesData from '../content/fixtures.json';
import type { MatchPublic } from '../types/api';

type FixtureJson = {
  id: number;
  roundNumber: number;
  matchNumber: number;
  bracketSlot: number;
  teamAName: string | null;
  teamBName: string | null;
  scheduledAt: string | null;
  venue: string | null;
  resultSummary: string | null;
  matchStatus: string;
};

export async function listPublishedMatches(): Promise<MatchPublic[]> {
  const rows = fixturesData as FixtureJson[];
  return rows.map((m) => ({
    id: m.id,
    roundNumber: m.roundNumber,
    matchNumber: m.matchNumber,
    bracketSlot: m.bracketSlot,
    teamAName: m.teamAName,
    teamBName: m.teamBName,
    teamARegistrationId: null,
    teamBRegistrationId: null,
    scheduledAt: m.scheduledAt,
    venue: m.venue,
    winnerName: null,
    resultSummary: m.resultSummary,
    matchStatus: m.matchStatus,
    published: true,
  }));
}
