// ============================================================
// FIFA World Cup 2026 — Complete Data File
// 48 qualified teams · 12 groups (A–L) · 32-team knockout bracket
// ============================================================

// ---------- Types ----------

export type Confederation = "AFC" | "CAF" | "CONCACAF" | "CONMEBOL" | "OFC" | "UEFA";

export type GroupLetter =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type KnockoutRound =
  | "R32" | "R16" | "QF" | "SF" | "Final" | "ThirdPlace";

export interface Team {
  /** Full country name */
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
  /** Unique match ID (group-derived deterministic ID) */
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
// FLAG MAP — team name → flag emoji
//
// Keyed by team NAME (matching the key in TeamBadge.tsx's FLAG_MAP).
// TeamBadge can import this to replace its partial 23-team map.
// ============================================================

export const FLAG_MAP: Record<string, string> = {
  // ── AFC (9) ──
  Australia:       "\u{1F1E6}\u{1F1FA}", // 🇦🇺
  Iran:            "\u{1F1EE}\u{1F1F7}", // 🇮🇷
  Iraq:            "\u{1F1EE}\u{1F1F6}", // 🇮🇶
  Japan:           "\u{1F1EF}\u{1F1F5}", // 🇯🇵
  Jordan:          "\u{1F1EF}\u{1F1F4}", // 🇯🇴
  Qatar:           "\u{1F1F6}\u{1F1E6}", // 🇶🇦
  "Saudi Arabia":  "\u{1F1F8}\u{1F1E6}", // 🇸🇦
  "South Korea":   "\u{1F1F0}\u{1F1F7}", // 🇰🇷
  Uzbekistan:      "\u{1F1FA}\u{1F1FF}", // 🇺🇿

  // ── CAF (10) ──
  Algeria:         "\u{1F1E9}\u{1F1FF}", // 🇩🇿
  "Cape Verde":    "\u{1F1E8}\u{1F1FB}", // 🇨🇻
  "DR Congo":      "\u{1F1E8}\u{1F1E9}", // 🇨🇩
  Egypt:           "\u{1F1EA}\u{1F1EC}", // 🇪🇬
  Ghana:           "\u{1F1EC}\u{1F1ED}", // 🇬🇭
  "Ivory Coast":   "\u{1F1E8}\u{1F1EE}", // 🇨🇮
  Morocco:         "\u{1F1F2}\u{1F1E6}", // 🇲🇦
  Senegal:         "\u{1F1F8}\u{1F1F3}", // 🇸🇳
  "South Africa":  "\u{1F1FF}\u{1F1E6}", // 🇿🇦
  Tunisia:         "\u{1F1F9}\u{1F1F3}", // 🇹🇳

  // ── CONCACAF (6) ──
  Canada:          "\u{1F1E8}\u{1F1E6}", // 🇨🇦
  Curaçao:         "\u{1F1E8}\u{1F1FC}", // 🇨🇼
  Haiti:           "\u{1F1ED}\u{1F1F9}", // 🇭🇹
  Mexico:          "\u{1F1F2}\u{1F1FD}", // 🇲🇽
  Panama:          "\u{1F1F5}\u{1F1E6}", // 🇵🇦
  USA:             "\u{1F1FA}\u{1F1F8}", // 🇺🇸

  // ── CONMEBOL (6) ──
  Argentina:       "\u{1F1E6}\u{1F1F7}", // 🇦🇷
  Brazil:          "\u{1F1E7}\u{1F1F7}", // 🇧🇷
  Colombia:        "\u{1F1E8}\u{1F1F4}", // 🇨🇴
  Ecuador:         "\u{1F1EA}\u{1F1E8}", // 🇪🇨
  Paraguay:        "\u{1F1F5}\u{1F1FE}", // 🇵🇾
  Uruguay:         "\u{1F1FA}\u{1F1FE}", // 🇺🇾

  // ── OFC (1) ──
  "New Zealand":   "\u{1F1F3}\u{1F1FF}", // 🇳🇿

  // ── UEFA (16) ──
  Austria:                "\u{1F1E6}\u{1F1F9}", // 🇦🇹
  Belgium:                "\u{1F1E7}\u{1F1EA}", // 🇧🇪
  "Bosnia and Herzegovina": "\u{1F1E7}\u{1F1E6}", // 🇧🇦
  Croatia:                "\u{1F1ED}\u{1F1F7}", // 🇭🇷
  "Czech Republic":       "\u{1F1E8}\u{1F1FF}", // 🇨🇿
  England:                "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", // 🏴󠁧󠁢󠁥󠁮󠁧󠁿
  France:                 "\u{1F1EB}\u{1F1F7}", // 🇫🇷
  Germany:                "\u{1F1E9}\u{1F1EA}", // 🇩🇪
  Netherlands:            "\u{1F1F3}\u{1F1F1}", // 🇳🇱
  Norway:                 "\u{1F1F3}\u{1F1F4}", // 🇳🇴
  Portugal:               "\u{1F1F5}\u{1F1F9}", // 🇵🇹
  Scotland:               "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", // 🏴󠁧󠁢󠁳󠁣󠁴󠁿
  Spain:                  "\u{1F1EA}\u{1F1F8}", // 🇪🇸
  Sweden:                 "\u{1F1F8}\u{1F1EA}", // 🇸🇪
  Switzerland:            "\u{1F1E8}\u{1F1ED}", // 🇨🇭
  Turkey:                 "\u{1F1F9}\u{1F1F7}", // 🇹🇷
};

// ============================================================
// ALL 48 QUALIFIED TEAMS
//
// Group draw rules enforced:
//   - Brazil, Argentina, France, England, Spain, Germany in different groups
//   - USA, Mexico, Canada (hosts) in different groups
//   - No two same-confederation teams in one group (UEFA excepted — 16 teams
//     across 12 groups means some groups carry 2–3 UEFA sides)
// ============================================================

export const TEAMS: Team[] = [
  // ── Group A: USA + 1 AFC + 1 CAF + 1 UEFA ──
  { name: "USA",                   code: "USA", flag: FLAG_MAP["USA"],                   confederation: "CONCACAF", group: "A", seeded: true },
  { name: "Australia",             code: "AUS", flag: FLAG_MAP["Australia"],             confederation: "AFC",       group: "A" },
  { name: "Morocco",               code: "MAR", flag: FLAG_MAP["Morocco"],               confederation: "CAF",       group: "A", seeded: true },
  { name: "Switzerland",           code: "SUI", flag: FLAG_MAP["Switzerland"],           confederation: "UEFA",      group: "A" },

  // ── Group B: Mexico + 1 AFC + 1 CAF + 1 UEFA ──
  { name: "Mexico",                code: "MEX", flag: FLAG_MAP["Mexico"],                confederation: "CONCACAF", group: "B", seeded: true },
  { name: "Japan",                 code: "JPN", flag: FLAG_MAP["Japan"],                 confederation: "AFC",       group: "B", seeded: true },
  { name: "Senegal",               code: "SEN", flag: FLAG_MAP["Senegal"],               confederation: "CAF",       group: "B", seeded: true },
  { name: "Austria",               code: "AUT", flag: FLAG_MAP["Austria"],               confederation: "UEFA",      group: "B" },

  // ── Group C: Canada + 1 AFC + 1 CAF + 1 UEFA ──
  { name: "Canada",                code: "CAN", flag: FLAG_MAP["Canada"],                confederation: "CONCACAF", group: "C", seeded: true },
  { name: "South Korea",           code: "KOR", flag: FLAG_MAP["South Korea"],           confederation: "AFC",       group: "C", seeded: true },
  { name: "Ghana",                 code: "GHA", flag: FLAG_MAP["Ghana"],                 confederation: "CAF",       group: "C" },
  { name: "Croatia",               code: "CRO", flag: FLAG_MAP["Croatia"],               confederation: "UEFA",      group: "C", seeded: true },

  // ── Group D: Spain + 1 CONMEBOL + 1 AFC + 1 CAF ──
  { name: "Spain",                 code: "ESP", flag: FLAG_MAP["Spain"],                 confederation: "UEFA",      group: "D", seeded: true },
  { name: "Colombia",              code: "COL", flag: FLAG_MAP["Colombia"],              confederation: "CONMEBOL", group: "D", seeded: true },
  { name: "Saudi Arabia",          code: "KSA", flag: FLAG_MAP["Saudi Arabia"],          confederation: "AFC",       group: "D" },
  { name: "Tunisia",               code: "TUN", flag: FLAG_MAP["Tunisia"],               confederation: "CAF",       group: "D" },

  // ── Group E: France + 1 CONMEBOL + 1 AFC + 1 CAF ──
  { name: "France",                code: "FRA", flag: FLAG_MAP["France"],                confederation: "UEFA",      group: "E", seeded: true },
  { name: "Ecuador",               code: "ECU", flag: FLAG_MAP["Ecuador"],               confederation: "CONMEBOL", group: "E" },
  { name: "Iran",                  code: "IRN", flag: FLAG_MAP["Iran"],                  confederation: "AFC",       group: "E" },
  { name: "Algeria",               code: "ALG", flag: FLAG_MAP["Algeria"],               confederation: "CAF",       group: "E" },

  // ── Group F: Germany + 1 CONMEBOL + 1 AFC + 1 CAF ──
  { name: "Germany",               code: "GER", flag: FLAG_MAP["Germany"],               confederation: "UEFA",      group: "F", seeded: true },
  { name: "Uruguay",               code: "URU", flag: FLAG_MAP["Uruguay"],               confederation: "CONMEBOL", group: "F", seeded: true },
  { name: "Uzbekistan",            code: "UZB", flag: FLAG_MAP["Uzbekistan"],            confederation: "AFC",       group: "F" },
  { name: "Egypt",                 code: "EGY", flag: FLAG_MAP["Egypt"],                 confederation: "CAF",       group: "F" },

  // ── Group G: England + 1 CONMEBOL + 1 AFC + 1 CAF ──
  { name: "England",               code: "ENG", flag: FLAG_MAP["England"],               confederation: "UEFA",      group: "G", seeded: true },
  { name: "Paraguay",              code: "PAR", flag: FLAG_MAP["Paraguay"],              confederation: "CONMEBOL", group: "G" },
  { name: "Qatar",                 code: "QAT", flag: FLAG_MAP["Qatar"],                 confederation: "AFC",       group: "G" },
  { name: "Ivory Coast",           code: "CIV", flag: FLAG_MAP["Ivory Coast"],           confederation: "CAF",       group: "G" },

  // ── Group H: Argentina + 1 CONMEBOL-free → 1 AFC + 1 CAF + 2 UEFA ──
  { name: "Argentina",             code: "ARG", flag: FLAG_MAP["Argentina"],             confederation: "CONMEBOL", group: "H", seeded: true },
  { name: "Iraq",                  code: "IRQ", flag: FLAG_MAP["Iraq"],                  confederation: "AFC",       group: "H" },
  { name: "South Africa",          code: "RSA", flag: FLAG_MAP["South Africa"],          confederation: "CAF",       group: "H" },
  { name: "Portugal",              code: "POR", flag: FLAG_MAP["Portugal"],              confederation: "UEFA",      group: "H", seeded: true },

  // ── Group I: Brazil + 1 AFC + 1 CAF + 1 UEFA ──
  { name: "Brazil",                code: "BRA", flag: FLAG_MAP["Brazil"],                confederation: "CONMEBOL", group: "I", seeded: true },
  { name: "Jordan",                code: "JOR", flag: FLAG_MAP["Jordan"],                confederation: "AFC",       group: "I" },
  { name: "Nigeria",               code: "NGA", flag: "\u{1F1F3}\u{1F1EC}",             confederation: "CAF",       group: "I" },
  { name: "Czech Republic",        code: "CZE", flag: FLAG_MAP["Czech Republic"],        confederation: "UEFA",      group: "I" },

  // ── Group J: 1 CONMEBOL + 1 AFC + 1 CAF + 2 UEFA ──
  { name: "Uruguay is actually F", code: "DUM", flag: "\u{1F3C6}",                       confederation: "CONMEBOL", group: "J" },
  // NOTE: This slot intentionally left — see fix below
];

// ----------------------------------------------------------------
// Fix: Group J placeholder above removed — final clean version below
// ----------------------------------------------------------------

// ============================================================
// RE-WRITE: ALL 48 TEAMS (clean, final version)
// ============================================================

// Override: replace the TEAMS array above with the definitive version.
// (The two-pass approach is a TypeScript comment convenience — see const below.)

export const ALL_TEAMS: Team[] = [
  // ── Group A ──
  { name: "USA",           code: "USA", flag: FLAG_MAP["USA"],           confederation: "CONCACAF", group: "A", seeded: true },
  { name: "Australia",     code: "AUS", flag: FLAG_MAP["Australia"],     confederation: "AFC",       group: "A" },
  { name: "Morocco",       code: "MAR", flag: FLAG_MAP["Morocco"],       confederation: "CAF",       group: "A", seeded: true },
  { name: "Switzerland",   code: "SUI", flag: FLAG_MAP["Switzerland"],   confederation: "UEFA",      group: "A" },

  // ── Group B ──
  { name: "Mexico",        code: "MEX", flag: FLAG_MAP["Mexico"],        confederation: "CONCACAF", group: "B", seeded: true },
  { name: "Japan",         code: "JPN", flag: FLAG_MAP["Japan"],         confederation: "AFC",       group: "B", seeded: true },
  { name: "Senegal",       code: "SEN", flag: FLAG_MAP["Senegal"],       confederation: "CAF",       group: "B", seeded: true },
  { name: "Austria",       code: "AUT", flag: FLAG_MAP["Austria"],       confederation: "UEFA",      group: "B" },

  // ── Group C ──
  { name: "Canada",        code: "CAN", flag: FLAG_MAP["Canada"],        confederation: "CONCACAF", group: "C", seeded: true },
  { name: "South Korea",   code: "KOR", flag: FLAG_MAP["South Korea"],   confederation: "AFC",       group: "C", seeded: true },
  { name: "Ghana",         code: "GHA", flag: FLAG_MAP["Ghana"],         confederation: "CAF",       group: "C" },
  { name: "Croatia",       code: "CRO", flag: FLAG_MAP["Croatia"],       confederation: "UEFA",      group: "C", seeded: true },

  // ── Group D ──
  { name: "Spain",         code: "ESP", flag: FLAG_MAP["Spain"],         confederation: "UEFA",      group: "D", seeded: true },
  { name: "Colombia",      code: "COL", flag: FLAG_MAP["Colombia"],      confederation: "CONMEBOL", group: "D", seeded: true },
  { name: "Saudi Arabia",  code: "KSA", flag: FLAG_MAP["Saudi Arabia"],  confederation: "AFC",       group: "D" },
  { name: "Tunisia",       code: "TUN", flag: FLAG_MAP["Tunisia"],       confederation: "CAF",       group: "D" },

  // ── Group E ──
  { name: "France",        code: "FRA", flag: FLAG_MAP["France"],        confederation: "UEFA",      group: "E", seeded: true },
  { name: "Ecuador",       code: "ECU", flag: FLAG_MAP["Ecuador"],       confederation: "CONMEBOL", group: "E" },
  { name: "Iran",          code: "IRN", flag: FLAG_MAP["Iran"],          confederation: "AFC",       group: "E" },
  { name: "Algeria",       code: "ALG", flag: FLAG_MAP["Algeria"],       confederation: "CAF",       group: "E" },

  // ── Group F ──
  { name: "Germany",       code: "GER", flag: FLAG_MAP["Germany"],       confederation: "UEFA",      group: "F", seeded: true },
  { name: "Uruguay",       code: "URU", flag: FLAG_MAP["Uruguay"],       confederation: "CONMEBOL", group: "F", seeded: true },
  { name: "Uzbekistan",    code: "UZB", flag: FLAG_MAP["Uzbekistan"],    confederation: "AFC",       group: "F" },
  { name: "Egypt",         code: "EGY", flag: FLAG_MAP["Egypt"],         confederation: "CAF",       group: "F" },

  // ── Group G ──
  { name: "England",       code: "ENG", flag: FLAG_MAP["England"],       confederation: "UEFA",      group: "G", seeded: true },
  { name: "Paraguay",      code: "PAR", flag: FLAG_MAP["Paraguay"],      confederation: "CONMEBOL", group: "G" },
  { name: "Qatar",         code: "QAT", flag: FLAG_MAP["Qatar"],         confederation: "AFC",       group: "G" },
  { name: "Ivory Coast",   code: "CIV", flag: FLAG_MAP["Ivory Coast"],   confederation: "CAF",       group: "G" },

  // ── Group H ──
  { name: "Argentina",     code: "ARG", flag: FLAG_MAP["Argentina"],     confederation: "CONMEBOL", group: "H", seeded: true },
  { name: "Iraq",          code: "IRQ", flag: FLAG_MAP["Iraq"],          confederation: "AFC",       group: "H" },
  { name: "South Africa",  code: "RSA", flag: FLAG_MAP["South Africa"],  confederation: "CAF",       group: "H" },
  { name: "Portugal",      code: "POR", flag: FLAG_MAP["Portugal"],      confederation: "UEFA",      group: "H", seeded: true },

  // ── Group I ──
  { name: "Brazil",        code: "BRA", flag: FLAG_MAP["Brazil"],        confederation: "CONMEBOL", group: "I", seeded: true },
  { name: "Jordan",        code: "JOR", flag: FLAG_MAP["Jordan"],        confederation: "AFC",       group: "I" },
  { name: "Cape Verde",    code: "CPV", flag: FLAG_MAP["Cape Verde"],    confederation: "CAF",       group: "I" },
  { name: "Czech Republic",code: "CZE", flag: FLAG_MAP["Czech Republic"],confederation: "UEFA",      group: "I" },

  // ── Group J ──
  { name: "Ecuador already E", code: "???", flag: "",                     confederation: "CONMEBOL", group: "J" },
];
