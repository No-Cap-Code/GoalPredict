// ============================================================
// GoalPredict — AI Commentary System (QVAC-powered)
// Generates realistic live football match commentary
// ============================================================

export type CommentEventType =
  | "goal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "chance"
  | "corner"
  | "free_kick"
  | "offside"
  | "save"
  | "half_time"
  | "full_time"
  | "var_review"
  | "injury"
  | "penalty"
  | "build_up";

export interface CommentaryEvent {
  id: string;
  minute: number;
  type: CommentEventType;
  text: string;
  isHomeTeam: boolean;
  timestamp: number;
}

// ============================================================
// COMMENTARY TEMPLATES
// ============================================================

const GOAL_TEMPLATES = [
  "GOOOOOAL! {player} strikes from the edge of the box and fires {team} into the lead!",
  "IT'S IN! A brilliant finish by {player}! {team} take the advantage!",
  "What a goal! {player} curls it into the top corner! {team} are ahead!",
  "Scoring opportunity taken! {player} slots it past the keeper. {team} lead!",
  "Magnificent! {player} volleys home from close range! {team} celebrate!",
  "GOAL! A thunderous strike from {player}! {team} are in front!",
  "The net ripples! {player} heads it in from the cross! {team} score!",
  "Clinical finish! {player} makes no mistake from 10 yards out! {team} lead!",
];

const CHANCE_TEMPLATES = [
  "{team} push forward. {player} fires just wide of the post!",
  "Great build-up play from {team}! {player}'s shot is blocked!",
  "{player} gets behind the defence but the keeper comes out to smother!",
  "A dangerous cross from {player} but no one can get on the end of it!",
  "{team} working it well through the midfield. {player} tries from distance — over the bar!",
  "So close! {player} hits the crossbar from a brilliant free kick!",
  "{team} break on the counter! {player} is through on goal but drags it wide!",
];

const CARD_TEMPLATES = {
  yellow: [
    "{player} goes into the book for a late challenge. That's a yellow card.",
    "The referee shows yellow to {player} for a reckless tackle.",
    "Caution for {player} — the referee had no choice there.",
    "{player} picks up a yellow card for simulation.",
  ],
  red: [
    "RED CARD! {player} is sent off! {team} are down to 10 men!",
    "It's a straight red for {player}! A dangerous challenge!",
    "The referee brandishes red! {player} must walk! {team} are in trouble!",
  ],
};

const SUBSTITUTION_TEMPLATES = [
  "Tactical change for {team}: {player} comes on.",
  "{team} make a substitution. {player} replaces the tired midfielder.",
  "Fresh legs for {team} — {player} enters the fray.",
  "Double change for {team}: {player} is introduced.",
];

const VAR_TEMPLATES = [
  "The referee is checking with VAR... This could change everything!",
  "VAR review in progress. The referee is heading to the monitor...",
  "After VAR intervention, the referee reverses the original decision!",
  "VAR confirms the goal stands! The on-field decision is upheld!",
];

const HALF_TIME_TEMPLATES = [
  "The referee blows for half time! It's been a closely contested first half.",
  "Half time! Both teams head to the tunnel. A tactical battle so far.",
  "The half-time whistle goes! What an entertaining 45 minutes!",
];

const FULL_TIME_TEMPLATES = [
  "FULL TIME! What a match! The final whistle confirms the result!",
  "It's all over! A hard-fought contest comes to an end!",
  "The final whistle blows! What a game we've witnessed!",
];

const BUILD_UP_TEMPLATES = [
  "{team} looking to build from the back. Patient play through the midfield.",
  "Good pressing from {team} high up the pitch. They win the ball back.",
  "{team} comfortable in possession. Moving the ball from side to side.",
  "A long ball forward from {team} but the defence deals with it comfortably.",
  "{team} win a corner. Can they create something from the set piece?",
  "Quick passing from {team} through the middle. They're looking dangerous.",
  "{team} switch play to the left. The full-back overlaps!",
];

const PLAYER_NAMES: Record<string, string[]> = {
  "AUS": ["Sam Kerr", "Mathew Leckie", "Craig Goodwin", "Martin Boyle"],
  "IRN": ["Sardar Azmoun", "Mehdi Taremi", "Karim Ansarifard"],
  "IRQ": ["Mohannad Ali", "Alaa Abbas", "Hussein Ali"],
  "JPN": ["Kaoru Mitoma", "Takumi Minamino", "Daizen Maeda", "Ritsu Doan"],
  "JOR": ["Youssef Ahmad", "Mousa Tamari"],
  "QAT": ["Akram Afif", "Almoez Ali", "Hasan Al-Haydos"],
  "KSA": ["Saleh Al-Shehri", "Salem Al-Dawsari"],
  "KOR": ["Son Heung-min", "Cho Gue-sung", "Lee Kang-in"],
  "UZB": ["Eldor Shomurodov", "Otabek Shukurov"],
  "ALG": ["Riyad Mahrez", "Islam Slimani", "Ismaël Bennacer"],
  "CPV": ["Ryan Mendes", "Garry Rodrigues"],
  "COD": ["Cédric Bakambu", "Victor Osimhen", "Jean-Pierre Nsame"],
  "EGY": ["Mohamed Salah", "Mostafa Mohamed", "Trézéguet"],
  "GHA": ["Inaki Williams", "Mohammed Kudus", "André Ayew"],
  "CIV": ["Sébastien Haller", "Nicolas Pépé", "Jonathan Bamba"],
  "MAR": ["Youssef En-Nesyri", "Hakim Ziyech", "Achraf Hakimi", "Sofiane Boufal"],
  "SEN": ["Sadio Mané", "Ismaïla Sarr", "Krépin Diatta"],
  "RSA": ["Percy Tau", "Luther Singh"],
  "TUN": ["Wahbi Khazri", "Youssef Msakni"],
  "CAN": ["Alphonso Davies", "Jonathan David", "Tajon Buchanan"],
  "CUW": ["Leandro Bacuna", "Jürgen Locadia"],
  "HAI": ["Duckens Nazon", "Steevens Joseph"],
  "MEX": ["Raúl Jiménez", "Hirving Lozano", "Edson Álvarez", "Santiago Giménez"],
  "PAN": ["Ismael Díaz", "Cecil Waterman"],
  "USA": ["Christian Pulisic", "Weston McKennie", "Folarin Balogun", "Tim Weah", "Giovanni Reyna"],
  "ARG": ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Ángel Di María"],
  "BRA": ["Vinícius Jr.", "Rodrygo", "Raphinha", "Richarlison", "Endrick"],
  "COL": ["Luis Díaz", "James Rodríguez", "Jhon Durán", "Juan Cuadrado"],
  "ECU": ["Moisés Caicedo", "Enner Valencia", "Gonzalo Plata"],
  "PAR": ["Miguel Almirón", "Julio Enciso", "Antonio Sanabria"],
  "URU": ["Luis Suárez", "Edinson Cavani", "Federico Valverde", "Darwin Núñez"],
  "NZL": ["Chris Wood", "Libby Cacace"],
  "AUT": ["Marko Arnautović", "Xaver Schlager", "David Alaba"],
  "BEL": ["Romelu Lukaku", "Kevin De Bruyne", "Jérémy Doku", "Eden Hazard"],
  "BIH": ["Edin Džeko", "Miralem Pjanić"],
  "CRO": ["Luka Modrić", "Ivan Perišić", "Mario Mandžukić", "Ante Rebić"],
  "CZE": ["Patrik Schick", "Antonín Barák", "Tomáš Souček"],
  "ENG": ["Harry Kane", "Bukayo Saka", "Jude Bellingham", "Phil Foden", "Marcus Rashford"],
  "FRA": ["Kylian Mbappé", "Ousmane Dembélé", "Antoine Griezmann", "Thuram"],
  "GER": ["Kai Havertz", "Jamal Musiala", "Florian Wirtz", "Leroy Sané"],
  "NED": ["Cody Gakpo", "Memphis Depay", "Frenkie de Jong", "Xavi Simons"],
  "NOR": ["Erling Haaland", "Martin Ødegaard"],
  "POR": ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão", "Bernardo Silva"],
  "SCO": ["Scott McTominay", "Lyndon Dykes", "John McGinn"],
  "ESP": ["Pedri", "Gavi", "Álvaro Morata", "Ferrán Torres", "Lamine Yamal"],
  "SWE": ["Alexander Isak", "Dejan Kulusevski"],
  "SUI": ["Xherdan Shaqiri", "Breel Embolo", "Granit Xhaka"],
  "TUR": ["Hakan Çalhanoğlu", "Arda Güler", "Kerem Aktürkoğlu"],
};

function getPlayerName(teamCode: string): string {
  const players = PLAYER_NAMES[teamCode] || ["the striker"];
  return players[Math.floor(Math.random() * players.length)];
}

function formatMinute(minute: number): string {
  if (minute > 45 && minute <= 50) return `45+${minute - 45}`;
  if (minute > 90 && minute <= 95) return `90+${minute - 90}`;
  if (minute === 45) return "45'";
  if (minute === 90) return "90'";
  return `${minute}'`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// MAIN GENERATION FUNCTIONS
// ============================================================

let eventCounter = 0;

function createEvent(
  minute: number,
  type: CommentEventType,
  text: string,
  isHomeTeam: boolean,
): CommentaryEvent {
  return {
    id: `evt-${++eventCounter}-${minute}`,
    minute,
    type,
    text,
    isHomeTeam,
    timestamp: Date.now(),
  };
}

export function generateCommentary(
  homeTeam: string,
  awayTeam: string,
  minute: number,
): CommentaryEvent | null {
  const isHomeEvent = Math.random() > 0.5;
  const team = isHomeEvent ? homeTeam : awayTeam;
  const teamCode = isHomeEvent ? homeTeam : awayTeam;

  // Key events at specific minutes
  if (minute === 45) {
    return createEvent(minute, "half_time",
      pickRandom(HALF_TIME_TEMPLATES), isHomeEvent);
  }
  if (minute === 90) {
    return createEvent(minute, "full_time",
      pickRandom(FULL_TIME_TEMPLATES), isHomeEvent);
  }

  // Goals: ~8% chance per minute window (clustered around key moments)
  const goalChance = (minute % 15 === 0) ? 0.25 : 0.08;
  if (Math.random() < goalChance && minute > 1 && minute < 90) {
    const player = getPlayerName(teamCode);
    return createEvent(minute, "goal",
      pickRandom(GOAL_TEMPLATES).replace("{team}", team).replace("{player}", player),
      isHomeEvent);
  }

  // Yellow card: ~3% chance
  if (Math.random() < 0.03 && minute > 5) {
    const player = getPlayerName(teamCode);
    return createEvent(minute, "yellow_card",
      pickRandom(CARD_TEMPLATES.yellow).replace("{player}", player),
      isHomeEvent);
  }

  // Red card: ~0.5% chance (very rare)
  if (Math.random() < 0.005 && minute > 20) {
    const player = getPlayerName(teamCode);
    return createEvent(minute, "red_card",
      pickRandom(CARD_TEMPLATES.red).replace("{team}", team).replace("{player}", player),
      isHomeEvent);
  }

  // Substitution: ~4% chance after minute 60
  if (Math.random() < 0.04 && minute > 60) {
    const player = getPlayerName(teamCode);
    return createEvent(minute, "substitution",
      pickRandom(SUBSTITUTION_TEMPLATES).replace("{team}", team).replace("{player}", player),
      isHomeEvent);
  }

  // VAR review: ~1% chance
  if (Math.random() < 0.01 && minute > 10) {
    return createEvent(minute, "var_review",
      pickRandom(VAR_TEMPLATES), isHomeEvent);
  }

  // Chance: ~15% chance (most common event)
  if (Math.random() < 0.15) {
    const player = getPlayerName(teamCode);
    return createEvent(minute, "chance",
      pickRandom(CHANCE_TEMPLATES).replace("{team}", team).replace("{player}", player),
      isHomeEvent);
  }

  // Build-up play: ~20% chance (filler)
  if (Math.random() < 0.20) {
    return createEvent(minute, "build_up",
      pickRandom(BUILD_UP_TEMPLATES).replace("{team}", team),
      isHomeEvent);
  }

  return null; // No event this minute
}

export function generateFullMatchCommentary(
  homeTeam: string,
  awayTeam: string,
): CommentaryEvent[] {
  const events: CommentaryEvent[] = [];
  for (let minute = 1; minute <= 90; minute++) {
    const event = generateCommentary(homeTeam, awayTeam, minute);
    if (event) {
      events.push(event);
    }
  }
  return events;
}

export function getLiveCommentary(
  homeTeam: string,
  awayTeam: string,
  currentMinute: number,
): CommentaryEvent[] {
  const all = generateFullMatchCommentary(homeTeam, awayTeam);
  return all.filter(e => e.minute <= currentMinute);
}

export { formatMinute, pickRandom };
