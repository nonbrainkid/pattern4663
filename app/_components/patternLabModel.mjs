export const PHASES = Object.freeze(["NOISE", "RULE", "PATTERN", "SIGNAL"]);
export const LENSES = Object.freeze(["NATURE", "CODE", "CROWDS", "MARKETS"]);

export const INITIAL_RESOLVER_STATE = Object.freeze({
  phase: 0,
  attempts: 0,
  solved: false,
  message: "",
});

export function resolveGuess(guess) {
  return guess === 3
    ? { correct: true, phase: 3, message: "Signal resolved." }
    : {
        correct: false,
        phase: 2,
        message: "Look for the repeating interval.",
      };
}

export function normalizeLens(lens) {
  if (typeof lens !== "string") return null;
  const normalized = lens.trim().toUpperCase();
  return LENSES.includes(normalized) ? normalized : null;
}

export function createFieldNote(lens) {
  const normalizedLens = normalizeLens(lens);
  if (!normalizedLens) return "";

  return [
    `OBSERVER / ${normalizedLens}`,
    "SIGNAL / 4663",
    "I FOUND THE RULE INSIDE THE NOISE.",
    "PATTERN / P4663",
  ].join("\n");
}

export function resolverReducer(state, action) {
  if (action.type === "SET_PHASE") {
    return {
      ...state,
      phase: Math.max(0, Math.min(3, Number(action.phase))),
      message: "",
    };
  }

  if (action.type === "GUESS") {
    const result = resolveGuess(action.value);
    return {
      ...state,
      phase: result.phase,
      attempts: state.attempts + 1,
      solved: state.solved || result.correct,
      message: result.message,
    };
  }

  return state;
}

/**
 * @param {"native" | "clipboard"} channel
 * @param {unknown} [error]
 * @returns {"shared" | "copied" | "cancelled" | "failed"}
 */
export function shareOutcome(channel, error = null) {
  if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
    return "cancelled";
  }
  if (error) return "failed";
  return channel === "native" ? "shared" : "copied";
}

export function canonicalShareUrl(value) {
  const url = new URL(value);
  url.hash = "";
  return url.href;
}
