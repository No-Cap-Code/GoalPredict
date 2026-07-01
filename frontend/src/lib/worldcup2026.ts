// ============================================================
// FIFA World Cup 2026 — Complete Data File
// 48 qualified teams · 12 groups (A–L) · 32-team knockout bracket
//
// Group draw rules:
//   - Top seeds (Brazil, Argentina, France, England, Spain, Germany)
//     placed in different groups (Pot 1)
//   - Host nations (USA, Mexico, Canada) placed in different groups
//   - No two teams from the same confederation in one group
//     (UEFA excepted: 16 teams across 12 groups means some groups
//      carry 2–3 UEFA sides)
// ============================================================

// ---------- Types ----------

export type Confederation =
  | "AFC"
  | "CAF"
  | "CONCACAF"
  | "CONMEBOL"
  | "OFC"
  | "UEFA";

export type GroupLetter =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type KnockoutRound =
  | "R32" | "R16" | "QF" | "SF" | "Final" | "ThirdPlace";

export interface Team {
  /** Full country / team name */
  name: string;
  /** ISO 3166-1 alpha-3 */
  code: string;
  /** Flag emoji */
  flag: string;
  /** FIFA confederation */
  confederation: Confederation;
  /** Group letter (A–L) */
  group: GroupLetter;
  /** Whether this team was seeded (Pot 1) in the draw */
  seeded?: boolean;
}

export interface GroupMatch {
  /** Deterministic match ID derived from group + index */
  id: number;
  /** Group this match belongs to */
  group: GroupLetter;
  /** Home team name */
  homeTeam: string;
  /** Away team name */
  awayTeam: string;
  /** Matchday 1–3 */
  matchday: number;
}

export interface KnockoutMatch {
  /** Unique match ID */
  id: number;
  /** Round label */
  round: KnockoutRound;
  /** Human-readable label (e.g. "R32 Match 1", "Final") */
  label: string;
  /** Home team name or TBD placeholder */
  homeTeam: string;
  /** Away team name or TBD placeholder */
  awayTeam: string;
  /** ID of the knockout match this winner advances to (null = terminal) */
  nextMatchId: number | null;
}

// ============================================================
// FLAG MAP — team name -> flag emoji
//
// Keyed by team NAME so TeamBadge.tsx can merge / replace its
// partial FLAG_MAP with this complete 48-team version.
// ============================================================

export const FLAG_MAP: Record<string, string> = {
  // ---- AFC (9) ----
  Australia:       "\u{1F1E6}\u{1F1FA}",
  Iran:            "\u{1F1EE}\u{1F1F7}",
  Iraq:            "\u{1F1EE}\u{1F1F6}",
  Japan:           "\u{1F1EF}\u{1F1F5}",
  Jordan:          "\u{1F1EF}\u{1F1F4}",
  Qatar:           "\u{1F1F6}\u{1F1E6}",
  "Saudi Arabia":  "\u{1F1F8}\u{1F1E6}",
  "South Korea":   "\u{1F1F0}\u{1F1F7}",
  Uzbekistan:      "\u{1F1FA}\u{1F1FF}",

  // ---- CAF (10) ----
  Algeria:         "\u{1F1E9}\u{1F1FF}",
  "Cape Verde":    "\u{1F1E8}\u{1F1FB}",
  "DR Congo":      "\u{1F1E8}\u{1F1E9}",
  Egypt:           "\u{1F1EA}\u{1F1EC}",
  Ghana:           "\u{1F1EC}\u{1F1ED}",
  "Ivory Coast":   "\u{1F1E8}\u{1F1EE}",
  Morocco:         "\u{1F1F2}\u{1F1E6}",
  Senegal:         "\u{1F1F8}\u{1F1F3}",
  "South Africa":  "\u{1F1FF}\u{1F1E6}",
  Tunisia:         "\u{1F1F9}\u{1F1F3}",

  // ---- CONCACAF (6) ----
  Canada:          "\u{1F1E8}\u{1F1E6}",
  Curaçao:         "\u{1F1E8}\u{1F1FC}",
  Haiti:           "\u{1F1ED}\u{1F1F9}",
  Mexico:          "\u{1F1F2}\u{1F1FD}",
  Panama:          "\u{1F1F5}\u{1F1E6}",
  USA:             "\u{1F1FA}\u{1F1F8}",

  // ---- CONMEBOL (6) ----
  Argentina:       "\u{1F1E6}\u{1F1F7}",
  Brazil:          "\u{1F1E7}\u{1F1F7}",
  Colombia:        "\u{1F1E8}\u{1F1F4}",
  Ecuador:         "\u{1F1EA}\u{1F1E8}",
  Paraguay:        "\u{1F1F5}\u{1F1FE}",
  Uruguay:         "\u{1F1FA}\u{1F1FE}",

  // ---- OFC (1) ----
  "New Zealand":   "\u{1F1F3}\u{1F1FF}",

  // ---- UEFA (16) ----
  Austria:                   "\u{1F1E6}\u{1F1F9}",
  Belgium:                   "\u{1F1E7}\u{1F1EA}",
  "Bosnia and Herzegovina":  "\u{1F1E7}\u{1F1E6}",
  Croatia:                   "\u{1F1ED}\u{1F1F7}",
  "Czech Republic":          "\u{1F1E8}\u{1F1FF}",
  England:                   "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  France:                    "\u{1F1EB}\u{1F1F7}",
  Germany:                   "\u{1F1E9}\u{1F1EA}",
  Netherlands:               "\u{1F1F3}\u{1F1F1}",
  Norway:                    "\u{1F1F3}\u{1F1F4}",
  Portugal:                  "\u{1F1F5}\u{1F1F9}",
  Scotland:                  "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  Spain:                     "\u{1F1EA}\u{1F1F8}",
  Sweden:                    "\u{1F1F8}\u{1F1EA}",
  Switzerland:               "\u{1F1E8}\u{1F1ED}",
  Turkey:                    "\u{1F1F9}\u{1F1F7}",
};

// ============================================================
// ALL 48 QUALIFIED TEAMS
//
// Group composition:
//   A–J: 3 non-UEFA + 1 UEFA  (10 groups × 3 = 30 non-UEFA, 10 UEFA)
//   K–L: 1 non-UEFA + 3 UEFA  ( 2 groups × 1 =  2 non-UEFA,  6 UEFA)
//   Totals: 32 non-UEFA + 16 UEFA = 48
// ============================================================

export const TEAMS: Team[] = [
  // ============================================================
  // Group A — USA (host), Australia (AFC), Morocco (CAF), Switzerland (UEFA)
  // ============================================================
  { name: "USA",           code: "USA", flag: FLAG_MAP["USA"],           confederation: "CONCACAF", group: "A", seeded: true },
  { name: "Australia",     code: "AUS", flag: FLAG_MAP["Australia"],     confederation: "AFC",       group: "A" },
  { name: "Morocco",       code: "MAR", flag: FLAG_MAP["Morocco"],       confederation: "CAF",       group: "A", seeded: true },
  { name: "Switzerland",   code: "SUI", flag: FLAG_MAP["Switzerland"],   confederation: "UEFA",      group: "A" },

  // ============================================================
  // Group B — Mexico (host), Japan (AFC), Senegal (CAF), Austria (UEFA)
  // ============================================================
  { name: "Mexico",        code: "MEX", flag: FLAG_MAP["Mexico"],        confederation: "CONCACAF", group: "B", seeded: true },
  { name: "Japan",         code: "JPN", flag: FLAG_MAP["Japan"],         confederation: "AFC",       group: "B", seeded: true },
  { name: "Senegal",       code: "SEN", flag: FLAG_MAP["Senegal"],       confederation: "CAF",       group: "B", seeded: true },
  { name: "Austria",       code: "AUT", flag: FLAG_MAP["Austria"],       confederation: "UEFA",      group: "B" },

  // ============================================================
  // Group C — Canada (host), South Korea (AFC), Ghana (CAF), Croatia (UEFA)
  // ============================================================
  { name: "Canada",        code: "CAN", flag: FLAG_MAP["Canada"],        confederation: "CONCACAF", group: "C", seeded: true },
  { name: "South Korea",   code: "KOR", flag: FLAG_MAP["South Korea"],   confederation: "AFC",       group: "C", seeded: true },
  { name: "Ghana",         code: "GHA", flag: FLAG_MAP["Ghana"],         confederation: "CAF",       group: "C" },
  { name: "Croatia",       code: "CRO", flag: FLAG_MAP["Croatia"],       confederation: "UEFA",      group: "C", seeded: true },

  // ============================================================
  // Group D — Spain (UEFA), Colombia (CONMEBOL), Saudi Arabia (AFC), Tunisia (CAF)
  // ============================================================
  { name: "Spain",         code: "ESP", flag: FLAG_MAP["Spain"],         confederation: "UEFA",      group: "D", seeded: true },
  { name: "Colombia",      code: "COL", flag: FLAG_MAP["Colombia"],      confederation: "CONMEBOL", group: "D", seeded: true },
  { name: "Saudi Arabia",  code: "KSA", flag: FLAG_MAP["Saudi Arabia"],  confederation: "AFC",       group: "D" },
  { name: "Tunisia",       code: "TUN", flag: FLAG_MAP["Tunisia"],       confederation: "CAF",       group: "D" },

  // ============================================================
  // Group E — France (UEFA), Ecuador (CONMEBOL), Iran (AFC), Algeria (CAF)
  // ============================================================
  { name: "France",        code: "FRA", flag: FLAG_MAP["France"],        confederation: "UEFA",      group: "E", seeded: true },
  { name: "Ecuador",       code: "ECU", flag: FLAG_MAP["Ecuador"],       confederation: "CONMEBOL", group: "E" },
  { name: "Iran",          code: "IRN", flag: FLAG_MAP["Iran"],          confederation: "AFC",       group: "E" },
  { name: "Algeria",       code: "ALG", flag: FLAG_MAP["Algeria"],       confederation: "CAF",       group: "E" },

  // ============================================================
  // Group F — Germany (UEFA), Uruguay (CONMEBOL), Uzbekistan (AFC), Egypt (CAF)
  // ============================================================
  { name: "Germany",       code: "GER", flag: FLAG_MAP["Germany"],       confederation: "UEFA",      group: "F", seeded: true },
  { name: "Uruguay",       code: "URU", flag: FLAG_MAP["Uruguay"],       confederation: "CONMEBOL", group: "F", seeded: true },
  { name: "Uzbekistan",    code: "UZB", flag: FLAG_MAP["Uzbekistan"],    confederation: "AFC",       group: "F" },
  { name: "Egypt",         code: "EGY", flag: FLAG_MAP["Egypt"],         confederation: "CAF",       group: "F" },

  // ============================================================
  // Group G — England (UEFA), Paraguay (CONMEBOL), Qatar (AFC), Ivory Coast (CAF)
  // ============================================================
  { name: "England",       code: "ENG", flag: FLAG_MAP["England"],       confederation: "UEFA",      group: "G", seeded: true },
  { name: "Paraguay",      code: "PAR", flag: FLAG_MAP["Paraguay"],      confederation: "CONMEBOL", group: "G" },
  { name: "Qatar",         code: "QAT", flag: FLAG_MAP["Qatar"],         confederation: "AFC",       group: "G" },
  { name: "Ivory Coast",   code: "CIV", flag: FLAG_MAP["Ivory Coast"],   confederation: "CAF",       group: "G" },

  // ============================================================
  // Group H — Argentina (CONMEBOL), Iraq (AFC), South Africa (CAF), Portugal (UEFA)
  // ============================================================
  { name: "Argentina",     code: "ARG", flag: FLAG_MAP["Argentina"],     confederation: "CONMEBOL", group: "H", seeded: true },
  { name: "Iraq",          code: "IRQ", flag: FLAG_MAP["Iraq"],          confederation: "AFC",       group: "H" },
  { name: "South Africa",  code: "RSA", flag: FLAG_MAP["South Africa"],  confederation: "CAF",       group: "H" },
  { name: "Portugal",      code: "POR", flag: FLAG_MAP["Portugal"],      confederation: "UEFA",      group: "H", seeded: true },

  // ============================================================
  // Group I — Brazil (CONMEBOL), Jordan (AFC), Cape Verde (CAF), Czech Republic (UEFA)
  // ============================================================
  { name: "Brazil",        code: "BRA", flag: FLAG_MAP["Brazil"],        confederation: "CONMEBOL", group: "I", seeded: true },
  { name: "Jordan",        code: "JOR", flag: FLAG_MAP["Jordan"],        confederation: "AFC",       group: "I" },
  { name: "Cape Verde",    code: "CPV", flag: FLAG_MAP["Cape Verde"],    confederation: "CAF",       group: "I" },
  { name: "Czech Republic",code: "CZE", flag: FLAG_MAP["Czech Republic"],confederation: "UEFA",      group: "I" },

  // ============================================================
  // Group J — New Zealand (OFC), Panama (CONCACAF), DR Congo (CAF), Netherlands (UEFA)
  // ============================================================
  { name: "New Zealand",   code: "NZL", flag: FLAG_MAP["New Zealand"],   confederation: "OFC",       group: "J" },
  { name: "Panama",        code: "PAN", flag: FLAG_MAP["Panama"],        confederation: "CONCACAF", group: "J" },
  { name: "DR Congo",      code: "COD", flag: FLAG_MAP["DR Congo"],      confederation: "CAF",       group: "J" },
  { name: "Netherlands",   code: "NED", flag: FLAG_MAP["Netherlands"],   confederation: "UEFA",      group: "J", seeded: true },

  // ============================================================
  // Group K — Haiti (CONCACAF), Belgium (UEFA), Sweden (UEFA), Turkey (UEFA)
  // ============================================================
  { name: "Belgium",       code: "BEL", flag: FLAG_MAP["Belgium"],       confederation: "UEFA",      group: "K", seeded: true },
  { name: "Haiti",         code: "HAI", flag: FLAG_MAP["Haiti"],         confederation: "CONCACAF", group: "K" },
  { name: "Sweden",        code: "SWE", flag: FLAG_MAP["Sweden"],        confederation: "UEFA",      group: "K" },
  { name: "Turkey",        code: "TUR", flag: FLAG_MAP["Turkey"],        confederation: "UEFA",      group: "K" },

  // ============================================================
  // Group L — Curaçao (CONCACAF), Norway (UEFA), Bosnia (UEFA), Scotland (UEFA)
  // ============================================================
  { name: "Norway",                 code: "NOR", flag: FLAG_MAP["Norway"],                 confederation: "UEFA",      group: "L" },
  { name: "Bosnia and Herzegovina", code: "BIH", flag: FLAG_MAP["Bosnia and Herzegovina"], confederation: "UEFA",      group: "L" },
  { name: "Scotland",               code: "SCO", flag: FLAG_MAP["Scotland"],               confederation: "UEFA",      group: "L" },
  { name: "Curaçao",                code: "CUW", flag: FLAG_MAP["Curaçao"],                confederation: "CONCACAF", group: "L" },
];

// ============================================================
// GROUPS — Record<GroupLetter, Team[]>
// ============================================================

export const GROUP_LETTERS: GroupLetter[] = [
  "A", "B", "C", "D", "E", "F",
  "G", "H", "I", "J", "K", "L",
];

export const GROUPS: Record<GroupLetter, Team[]> = {} as Record<GroupLetter, Team[]>;

for (const letter of GROUP_LETTERS) {
  GROUPS[letter] = TEAMS.filter((t) => t.group === letter);
}

// ============================================================
// HELPER FUNCTIONS — Team lookups
// ============================================================

const _teamByCode = new Map<string, Team>();

for (const team of TEAMS) {
  _teamByCode.set(team.code, team);
}

/**
 * Lookup a team by its ISO 3166-1 alpha-3 code.
 *
 * @example getTeamByCode("BRA")
 * // => Team { name: "Brazil", code: "BRA", ... }
 */
export function getTeamByCode(code: string): Team | undefined {
  return _teamByCode.get(code.toUpperCase());
}

/**
 * Return the group letter for a given team code.
 *
 * @example getGroupByTeam("BRA")
 * // => "I"
 */
export function getGroupByTeam(teamCode: string): GroupLetter | undefined {
  return _teamByCode.get(teamCode.toUpperCase())?.group;
}

/**
 * Get the 4 teams in a group by letter.
 *
 * @example getTeamsByGroup("A")
 * // => [USA, Australia, Morocco, Switzerland]
 */
export function getTeamsByGroup(letter: string): Team[] {
  return GROUPS[letter.toUpperCase() as GroupLetter] ?? [];
}

// ============================================================
// GROUP MATCHES — Round-robin (6 matches per group)
//
// Schedule pattern for a group of 4 teams (indices 0-3):
//   Matchday 1: 0v3, 1v2
//   Matchday 2: 0v1, 2v3
//   Matchday 3: 0v2, 1v3
// ============================================================

const SCHEDULE: [number, number, number][] = [
  [0, 3, 1],
  [1, 2, 1],
  [0, 1, 2],
  [2, 3, 2],
  [0, 2, 3],
  [1, 3, 3],
];

/**
 * Return the 6 round-robin matches for a group.
 *
 * @example getGroupMatches("A")
 * // => [6 matches with homeTeam, awayTeam, matchday]
 */
export function getGroupMatches(groupLetter: string): GroupMatch[] {
  const letter = groupLetter.toUpperCase() as GroupLetter;
  const group = GROUPS[letter];
  if (!group || group.length !== 4) return [];

  const teams = group.map((t) => t.name);
  const matches: GroupMatch[] = [];

  for (let mi = 0; mi < SCHEDULE.length; mi++) {
    const [homeIdx, awayIdx, matchday] = SCHEDULE[mi];
    matches.push({
      id: _groupMatchId(letter, mi),
      group: letter,
      homeTeam: teams[homeIdx],
      awayTeam: teams[awayIdx],
      matchday,
    });
  }

  return matches;
}

/**
 * Get all 72 group stage matches (6 per group x 12 groups).
 */
export function getAllGroupMatches(): GroupMatch[] {
  const all: GroupMatch[] = [];
  for (const letter of GROUP_LETTERS) {
    all.push(...getGroupMatches(letter));
  }
  return all;
}

// ============================================================
// KNOCKOUT BRACKET — 32-team elimination stage
//
// Format: 12 group winners + 4 best runners-up seeded,
//         8 remaining runners-up + 8 best third-placed unseeded.
//         -> 32 -> 16 -> 8 -> 4 -> 2 + 1 third-place match.
//
// Placeholder team labels are used (e.g. "1A", "2B", "3C/D/E")
// since actual advancement depends on group outcomes.
// ============================================================

export function buildKnockoutBracket(): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];

  // ---- Match ID ranges ----
  const R32_START = 100;
  const R16_START = 200;
  const QF_START  = 300;
  const SF_START  = 400;
  const THIRD     = 500;
  const FINAL     = 501;

  // ================================================================
  // Round of 32 — 16 matches
  //
  // 12 group winners (1A-1L) + 4 best runners-up are seeded.
  // Remaining 8 runners-up + 8 best third-placed fill unseeded slots.
  //
  // Winners advance to R16 (indices 0-7).
  // ================================================================
  const r32: { home: string; away: string; r16Idx: number }[] = [
    { home: "1A", away: "3C/D/E",  r16Idx: 0 },
    { home: "2A", away: "2B",       r16Idx: 0 },
    { home: "1C", away: "3A/B/F",  r16Idx: 1 },
    { home: "2C", away: "2D",       r16Idx: 1 },
    { home: "1E", away: "3D/F/G",  r16Idx: 2 },
    { home: "2E", away: "2F",       r16Idx: 2 },
    { home: "1G", away: "3F/H/I",  r16Idx: 3 },
    { home: "2G", away: "2H",       r16Idx: 3 },
    { home: "1I", away: "3H/J/K",  r16Idx: 4 },
    { home: "2I", away: "2J",       r16Idx: 4 },
    { home: "1K", away: "3J/L/A",  r16Idx: 5 },
    { home: "2K", away: "2L",       r16Idx: 5 },
    { home: "1B", away: "3A/C/E",  r16Idx: 6 },
    { home: "1D", away: "3C/F/H",  r16Idx: 6 },
    { home: "1F", away: "3E/G/I",  r16Idx: 7 },
    { home: "1H", away: "3G/J/L",  r16Idx: 7 },
  ];

  for (let i = 0; i < r32.length; i++) {
    const pair = r32[i];
    matches.push({
      id: R32_START + i,
      round: "R32",
      label: `R32 Match ${i + 1}`,
      homeTeam: pair.home,
      awayTeam: pair.away,
      nextMatchId: R16_START + pair.r16Idx,
    });
  }

  // ================================================================
  // Round of 16 — 8 matches
  // Winners advance to QF (indices 0-3).
  // ================================================================
  const r16Labels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  for (let i = 0; i < r16Labels.length; i++) {
    matches.push({
      id: R16_START + i,
      round: "R16",
      label: `R16 — Match ${r16Labels[i]}`,
      homeTeam: `Winner R32-${i * 2 + 1}`,
      awayTeam: `Winner R32-${i * 2 + 2}`,
      nextMatchId: QF_START + Math.floor(i / 2),
    });
  }

  // ================================================================
  // Quarterfinals — 4 matches
  // Winners advance to SF (indices 0-1).
  // ================================================================
  const qfLabels = ["1", "2", "3", "4"];

  for (let i = 0; i < qfLabels.length; i++) {
    matches.push({
      id: QF_START + i,
      round: "QF",
      label: `QF — Match ${qfLabels[i]}`,
      homeTeam: `Winner R16-${r16Labels[i * 2]}`,
      awayTeam: `Winner R16-${r16Labels[i * 2 + 1]}`,
      nextMatchId: SF_START + Math.floor(i / 2),
    });
  }

  // ================================================================
  // Semifinals — 2 matches
  // Winners advance to Final. Losers go to Third-place playoff.
  // ================================================================
  matches.push({
    id: SF_START,
    round: "SF",
    label: "SF — Match 1",
    homeTeam: "Winner QF-1",
    awayTeam: "Winner QF-2",
    nextMatchId: FINAL,
  });

  matches.push({
    id: SF_START + 1,
    round: "SF",
    label: "SF — Match 2",
    homeTeam: "Winner QF-3",
    awayTeam: "Winner QF-4",
    nextMatchId: FINAL,
  });

  // ================================================================
  // Third-place playoff
  // ================================================================
  matches.push({
    id: THIRD,
    round: "ThirdPlace",
    label: "Third-Place Playoff",
    homeTeam: "Loser SF-1",
    awayTeam: "Loser SF-2",
    nextMatchId: null,
  });

  // ================================================================
  // Final
  // ================================================================
  matches.push({
    id: FINAL,
    round: "Final",
    label: "World Cup Final",
    homeTeam: "Winner SF-1",
    awayTeam: "Winner SF-2",
    nextMatchId: null,
  });

  return matches;
}

/**
 * Pre-built knockout bracket (computed once at module load).
 */
export const KNOCKOUT_BRACKET: KnockoutMatch[] = buildKnockoutBracket();

/**
 * Get knockout matches filtered by round.
 */
export function getKnockoutMatchesByRound(round: KnockoutRound): KnockoutMatch[] {
  return KNOCKOUT_BRACKET.filter((m) => m.round === round);
}

// ============================================================
// PRIVATE HELPERS
// ============================================================

/** Generate a deterministic match ID for group matches. */
function _groupMatchId(group: string, index: number): number {
  const offset = group.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
  return offset * 10 + index + 1;
}
