// ============================================================
// GoalPredict — QVAC AI prediction helper
//
// NOTE: This is a stub module for the hackathon demo.
// Replace the fetch logic with real QVAC SDK calls in production.
// ============================================================

export interface QVACPrediction {
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  predictedWinner: string;
  confidence: number; // 0-100
}

// Simulated model handle
let modelLoaded = false;

/**
 * Load the QVAC prediction model.
 * In production this calls the QVAC runtime to initialise the model.
 */
export async function loadPredictionModel(): Promise<boolean> {
  if (modelLoaded) return true;

  // Simulate network / model load time
  await new Promise((r) => setTimeout(r, 300));
  modelLoaded = true;
  console.log("[QVAC] Prediction model loaded");
  return true;
}

/**
 * Predict the outcome of a single match using QVAC completion.
 * Returns home win / draw / away win probabilities and a predicted winner.
 */
export async function predictMatch(
  homeTeam: string,
  awayTeam: string,
): Promise<QVACPrediction> {
  await loadPredictionModel();

  // --- deterministic pseudo-random based on team names for demo ---
  const seed = hashNames(homeTeam, awayTeam);
  const homeBase = 30 + (seed % 40); // 30-70
  const drawBase = 10 + ((seed >> 3) % 15); // 10-25

  const homeWinPct = clamp(homeBase, 5, 85);
  const drawPct = clamp(drawBase, 5, 25);
  const awayWinPct = clamp(100 - homeWinPct - drawPct, 5, 85);

  const predictedWinner =
    homeWinPct >= awayWinPct ? homeTeam : awayTeam;
  const confidence = Math.round(Math.max(homeWinPct, awayWinPct));

  return { homeWinPct, drawPct, awayWinPct, predictedWinner, confidence };
}

/**
 * Generate bracket picks for all rounds of matches.
 */
export async function generateBracketPicks(
  matches: { home: string; away: string }[],
): Promise<{ pickedWinner: string; confidence: number }[]> {
  await loadPredictionModel();

  const picks = await Promise.all(
    matches.map(async (m) => {
      const pred = await predictMatch(m.home, m.away);
      return {
        pickedWinner: pred.predictedWinner,
        confidence: pred.confidence,
      };
    }),
  );

  return picks;
}

// ---------- helpers ----------

function hashNames(a: string, b: string): number {
  let h = 0;
  const combined = a + b;
  for (let i = 0; i < combined.length; i++) {
    h = (h * 31 + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
