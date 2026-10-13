import type { PoolsFixturesBoardPhase, TeamsBoardPhase } from './publish';

export type RegistrationStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface TournamentPublic {
  id: number;
  name: string;
  description: string;
  format: string;
  entryFeePaise: number;
  maxTeams: number;
  minSquadSize: number;
  maxSquadSize: number;
  /** True when backend REGISTRATION_TEST_MIN_SQUAD is enabled (min squad exposed as 2). */
  registrationTestMode: boolean;
  registrationOpen: boolean;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  fixtureAnnouncementAt: string | null;
  /** Countdown target for public /pools (independent of fixtures). */
  poolsRevealAt: string | null;
  /** Countdown target for public /fixtures (independent of pools). */
  fixturesRevealAt: string | null;
  teamsBoardPhase: TeamsBoardPhase;
  poolsBoardPhase: PoolsFixturesBoardPhase;
  fixturesBoardPhase: PoolsFixturesBoardPhase;
  poolsDrawRun: number;
  fixturesDrawRun: number;
  teamsBoardRun: number;
  tournamentStartsAt: string | null;
  fixturesPublished: boolean;
  timezone: string;
  venue: string | null;
  rules: string | null;
  contact: { email: string | null; phone: string | null; address: string | null };
}

export interface TeamPublic {
  registrationId: string;
  teamName: string;
  logoUrl: string | null;
  status: RegistrationStatus;
  confirmedAt: string | null;
  sortOrder: number | null;
}

export interface TournamentAvailability {
  maxTeams: number;
  occupiedSlots: number;
  availableSlots: number;
  registrationOpen: boolean;
  entryFeePaise: number;
}

export interface MatchPublic {
  id: number;
  roundNumber: number;
  matchNumber: number;
  bracketSlot: number;
  teamAName: string | null;
  teamBName: string | null;
  teamARegistrationId: string | null;
  teamBRegistrationId: string | null;
  scheduledAt: string | null;
  venue: string | null;
  winnerName: string | null;
  resultSummary: string | null;
  matchStatus: string;
  published: boolean;
}

export interface AnnouncementPublic {
  title: string;
  message: string;
  publishedAt: string | null;
  priority: number;
}

export interface SponsorPublic {
  name: string;
  logoPath: string | null;
  website: string | null;
  category: string | null;
}

export interface GalleryPublic {
  imagePath: string;
  caption: string | null;
}
