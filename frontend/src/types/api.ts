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
  tournamentStartsAt: string | null;
  fixturesPublished: boolean;
  timezone: string;
  venue: string | null;
  rules: string | null;
  contact: { email: string | null; phone: string | null; address: string | null };
}

export interface TeamPublic {
  registrationId: number;
  teamName: string;
  logoUrl: string | null;
  status: RegistrationStatus;
  confirmedAt: string | null;
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
  teamARegistrationId: number | null;
  teamBRegistrationId: number | null;
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
