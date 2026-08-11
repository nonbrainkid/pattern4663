"use client";

import type { CSSProperties } from "react";
import { useMemo, useReducer, useState } from "react";
import { PatternMark } from "./PatternMark";
import {
  canonicalShareUrl,
  createFieldNote,
  INITIAL_RESOLVER_STATE,
  LENSES,
  PHASES,
  resolverReducer,
  shareOutcome,
} from "./patternLabModel.mjs";

type Phase = 0 | 1 | 2 | 3;
type Lens = (typeof LENSES)[number];
type ShareState = "idle" | "shared" | "copied" | "failed";
type ResolverState = {
  phase: Phase;
  attempts: number;
  solved: boolean;
  message: string;
};

const NOISE_POINTS = Array.from({ length: 36 }, (_, index) => ({
  x: 7 + ((index * 29 + 11) % 87),
  y: 9 + ((index * 43 + 17) % 79),
  delay: (index % 9) * 24,
}));

const RULE_GROUPS = [4, 6, 6, 3];
const RULE_POINTS = RULE_GROUPS.flatMap((count, group) =>
  Array.from({ length: count }, (_, point) => ({ group, point, count })),
);

function ResolverField({ phase }: { phase: Phase }) {
  return (
    <div className={`resolver-field resolver-field--phase-${phase}`} aria-hidden="true">
      {phase === 0 &&
        NOISE_POINTS.map((point, index) => (
          <i
            className={index === 22 ? "is-signal" : ""}
            key={index}
            style={
              {
                "--point-x": `${point.x}%`,
                "--point-y": `${point.y}%`,
                "--point-delay": `${point.delay}ms`,
              } as CSSProperties
            }
          />
        ))}

      {phase === 1 && (
        <div className="resolver-rule">
          {RULE_POINTS.map(({ group, point, count }) => (
            <span
              className="resolver-rule__point"
              key={`${group}-${point}`}
              style={
                {
                  "--group": group,
                  "--point": point,
                  "--count": count,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      {phase === 2 && (
        <div className="resolver-sequence">
          <span>4</span><span>6</span><span>6</span><span>3</span>
          <span>4</span><span>6</span><span>6</span><strong>?</strong>
        </div>
      )}

      {phase === 3 && (
        <div className="resolver-signal">
          <PatternMark />
          <strong>$P4663 / SIGNAL RESOLVED</strong>
        </div>
      )}
    </div>
  );
}

export function PatternLab() {
  const [resolverState, dispatch] = useReducer(
    resolverReducer,
    INITIAL_RESOLVER_STATE,
  );
  const { phase, attempts, solved, message: resolverMessage } =
    resolverState as ResolverState;
  const [lens, setLens] = useState<Lens | null>(null);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const fieldNote = useMemo(() => createFieldNote(lens), [lens]);

  const setResolution = (next: number) => {
    dispatch({ type: "SET_PHASE", phase: next });
  };

  const guess = (value: number) => {
    dispatch({ type: "GUESS", value });
  };

  const shareFieldNote = async () => {
    if (!solved || !fieldNote) return;
    setShareState("idle");

    const url = canonicalShareUrl(window.location.href);
    let channel: "native" | "clipboard" = "native";
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "PATTERN / P4663", text: fieldNote, url });
        const outcome = shareOutcome("native");
        if (outcome === "shared") setShareState(outcome);
        return;
      }

      channel = "clipboard";
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(`${fieldNote}\n${url}`);
      const outcome = shareOutcome("clipboard");
      if (outcome === "copied") setShareState(outcome);
    } catch (error) {
      const outcome = shareOutcome(channel, error);
      if (outcome === "cancelled") return;
      if (outcome === "failed") setShareState(outcome);
    }
  };

  const shareMessage = {
    idle: "",
    shared: "Field note shared.",
    copied: "Field note copied to clipboard.",
    failed: "Automatic sharing failed. Copy the field note manually.",
  }[shareState];

  return (
    <div className="resolver" data-pattern-resolver="guided">
      <div className="resolver__console">
        <header className="resolver__header">
          <p>GUIDED RESOLVER / 4663</p>
          <span>{solved ? "EARNED" : `ATTEMPTS / ${attempts}`}</span>
        </header>

        <ol className="resolver__phases" aria-label="Resolver phases">
          {PHASES.map((name, index) => (
            <li aria-current={phase === index ? "step" : undefined} key={name}>
              <span>{String(index).padStart(2, "0")}</span>{name}
            </li>
          ))}
        </ol>

        <ResolverField phase={phase} />

        <p className="sr-only" id="resolver-full-problem">
          The first sequence is 4, 6, 6, 3. What completes the repeating sequence
          4, 6, 6, question mark?
        </p>

        <div className="resolver__control">
          <label htmlFor="pattern-resolution">
            <span>RESOLUTION</span>
            <output htmlFor="pattern-resolution">{phase} / 3 · {PHASES[phase]}</output>
          </label>
          <input
            aria-describedby="resolution-help"
            aria-valuetext={`${PHASES[phase]}, resolution ${phase} of 3`}
            id="pattern-resolution"
            max="3"
            min="0"
            onChange={(event) => setResolution(Number(event.currentTarget.value))}
            step="1"
            type="range"
            value={phase}
          />
          <p id="resolution-help">Move from noise to rule. At pattern, name the missing interval.</p>
        </div>

        {phase === 2 && (
          <fieldset
            aria-describedby="resolver-full-problem"
            className="resolver-quiz"
            data-resolver-quiz="missing-interval"
          >
            <legend>WHAT COMPLETES 4 · 6 · 6 · ?</legend>
            <div>
              {[3, 4, 6].map((value) => (
                <button onClick={() => guess(value)} type="button" key={value}>{value}</button>
              ))}
            </div>
          </fieldset>
        )}

        <p className="resolver__announcement" aria-live="polite" aria-atomic="true">
          {resolverMessage}
        </p>

        {solved && (
          <p className="resolver__result">
            You did not create the pattern. <strong>You changed the resolution.</strong>
          </p>
        )}
      </div>

      <aside
        className="field-note"
        aria-labelledby="field-note-title"
        data-field-note-state={solved ? "earned" : "locked"}
        data-manual-fallback={shareState === "failed" ? "available" : "inactive"}
      >
        <div>
          <p className="field-note__eyebrow">EARNED FIELD NOTE</p>
          <h3 id="field-note-title">NAME THE LENS YOU USED.</h3>
          <p>
            {solved
              ? "The signal is resolved. Choose a lens and carry the observation forward."
              : "Resolve the missing interval to unlock your personal field note."}
          </p>
        </div>

        {solved ? (
          <div className="field-note__earned">
            <fieldset>
              <legend>CHOOSE A LENS</legend>
              <div className="field-note__lenses">
                {LENSES.map((value) => (
                  <button
                    aria-pressed={lens === value}
                    key={value}
                    onClick={() => {
                      setLens(value);
                      setShareState("idle");
                    }}
                    type="button"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>

            <pre className="field-note__preview" aria-live="polite">
              {fieldNote || "OBSERVER / SELECT A LENS\nSIGNAL / 4663\nPATTERN / P4663"}
            </pre>
            <button
              className="action action--primary field-note__share"
              disabled={!lens}
              onClick={shareFieldNote}
              type="button"
            >
              SHARE FIELD NOTE <span aria-hidden="true">↗</span>
            </button>
            <p className="field-note__status" aria-live="polite" aria-atomic="true">
              {shareMessage}
            </p>
            {shareState === "failed" && (
              <textarea
                aria-label="Field note for manual copying"
                onFocus={(event) => event.currentTarget.select()}
                readOnly
                rows={6}
                value={`${fieldNote}\n${canonicalShareUrl(window.location.href)}`}
              />
            )}
          </div>
        ) : (
          <div className="field-note__locked">
            <span aria-hidden="true"><PatternMark compact /></span>
            <span>LOCKED / RESOLVE SIGNAL</span>
            <button className="action field-note__share" disabled type="button">
              SHARE FIELD NOTE / LOCKED
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
