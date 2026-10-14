/** Fixed tournament roster (38 teams + 2 host slots = 40). */
export type RosterTeam = {
  teamName: string;
  captainPhoneDigits: string;
  sortOrder: number;
};

function digits(raw: string): string {
  return raw.replace(/\D/g, '');
}

export const TOURNAMENT_ROSTER_TEAMS: RosterTeam[] = [
  { sortOrder: 3, teamName: 'Dream Chasers', captainPhoneDigits: digits('6380120062') },
  { sortOrder: 4, teamName: 'Blasters', captainPhoneDigits: digits('9003421975') },
  { sortOrder: 5, teamName: 'Smashers', captainPhoneDigits: digits('8248869740') },
  { sortOrder: 6, teamName: 'Sports Star', captainPhoneDigits: digits('9123533460') },
  { sortOrder: 7, teamName: 'YDK', captainPhoneDigits: digits('9443916716') },
  { sortOrder: 8, teamName: 'Gully Boys', captainPhoneDigits: digits('6369616793') },
  { sortOrder: 9, teamName: 'Team Titan', captainPhoneDigits: digits('8122398593') },
  { sortOrder: 10, teamName: 'Bashers', captainPhoneDigits: digits('8220406359') },
  { sortOrder: 11, teamName: 'Spartanz', captainPhoneDigits: digits('8838063890') },
  { sortOrder: 12, teamName: '408 Kings', captainPhoneDigits: digits('7867835107') },
  { sortOrder: 13, teamName: 'Honey Badgers', captainPhoneDigits: digits('8610750861') },
  { sortOrder: 14, teamName: 'Sunday Boys', captainPhoneDigits: digits('8248454694') },
  { sortOrder: 15, teamName: '90s Kids', captainPhoneDigits: digits('9489239226') },
  { sortOrder: 16, teamName: 'LHS', captainPhoneDigits: digits('9361863847') },
  { sortOrder: 17, teamName: 'College Birds', captainPhoneDigits: digits('9965360182') },
  { sortOrder: 18, teamName: 'SSK', captainPhoneDigits: digits('9942252341') },
  { sortOrder: 19, teamName: 'VCC', captainPhoneDigits: digits('8838973626') },
  { sortOrder: 20, teamName: 'Sharkzz', captainPhoneDigits: digits('8675274463') },
  { sortOrder: 21, teamName: '11 Star', captainPhoneDigits: digits('8778351582') },
  { sortOrder: 22, teamName: 'Captains XI CC', captainPhoneDigits: digits('9940806933') },
  { sortOrder: 23, teamName: 'Hi-Flyers', captainPhoneDigits: digits('9944919987') },
  { sortOrder: 24, teamName: 'Pheonix', captainPhoneDigits: digits('6380634397') },
  { sortOrder: 25, teamName: 'Thunder CC', captainPhoneDigits: digits('7010031315') },
  { sortOrder: 26, teamName: 'Madmasters', captainPhoneDigits: digits('8072549895') },
  { sortOrder: 27, teamName: 'SR Independence', captainPhoneDigits: digits('9444810522') },
  { sortOrder: 28, teamName: 'Independence', captainPhoneDigits: digits('8760580584') },
  { sortOrder: 29, teamName: 'Bad Jokers', captainPhoneDigits: digits('8668108769') },
  { sortOrder: 30, teamName: 'Disaster', captainPhoneDigits: digits('6382992408') },
  { sortOrder: 31, teamName: 'Fearless', captainPhoneDigits: digits('9095718379') },
  { sortOrder: 32, teamName: 'Hollywood', captainPhoneDigits: digits('8940413970') },
  { sortOrder: 33, teamName: 'Falcons', captainPhoneDigits: digits('6374657639') },
  { sortOrder: 34, teamName: 'Scorpions', captainPhoneDigits: digits('9566894949') },
  { sortOrder: 35, teamName: 'INS', captainPhoneDigits: digits('8531879990') },
  { sortOrder: 36, teamName: 'SN Sports', captainPhoneDigits: digits('9789621961') },
  { sortOrder: 37, teamName: 'Game Changer', captainPhoneDigits: digits('6369144843') },
  { sortOrder: 38, teamName: 'Black Booster', captainPhoneDigits: digits('9626529034') },
  { sortOrder: 39, teamName: 'Neyveli Titans', captainPhoneDigits: digits('9360066103') },
  { sortOrder: 40, teamName: 'Luminous Lions', captainPhoneDigits: digits('7538830821') },
];

export const TOURNAMENT_MAX_TEAMS = 40;

function normalizeTeamName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function findRosterTeam(teamName: string): RosterTeam | undefined {
  const n = normalizeTeamName(teamName);
  return TOURNAMENT_ROSTER_TEAMS.find((t) => normalizeTeamName(t.teamName) === n);
}
