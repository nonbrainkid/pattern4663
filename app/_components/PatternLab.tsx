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
  x: 5 + ((index * 37 + 13) % 90),
  y: 6 + ((index * 53 + 19) % 87),
  size: index % 7 === 0 ? 7 : index % 3 === 0 ? 5 : 4,
  delay: (index % 9) * 31,
}));

const RULE_GROUPS = [4, 6, 6, 3] as const;

function ResolverField({ phase, solved }: { phase: Phase; solved: boolean }) {
  return (
    <div className={`resolver-field resolver-field--phase-${phase}`} aria-hidden="true">
      <span className="resolver-field__axis resolver-field__axis--x" />
      <span className="resolver-field__axis resolver-field__axis--y" />

      {phase === 0 && (
        <div className="resolver-noise">
          {NOISE_POINTS.map((point, index) => (
            <i
              className={index === 22 ? "is-signal" : ""}
              key={index}
              style={
                {
                  "--point-x": `${point.x}%`,
                  "--point-y": `${point.y}%`,
                  "--point-size": `${point.size}px`,
                  "--point-delay": `${point.delay}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      {phase === 1 && (
        <div className="resolver-rule">
          {RULE_GROUPS.map((count, group) => (
            <div className="resolver-rule__group" key={`${group}-${count}`}>
              <span className="resolver-rule__count">{String(count).padStart(2, "0")}</span>
              <div>
                {Array.from({ length: count }, (_, point) => (
                  <i className="resolver-rule__point" key={point} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {phase === 2 && (
        <div className="resolver-sequence">
          <p><span>04</span><span>06</span><span>06</span><span>03</span></p>
          <p><span>04</span><span>06</span><span>06</span><strong>?</strong></p>
        </div>
      )}

      {phase === 3 && solved && (
        <div className="resolver-signal">
          <PatternMark />
          <p><span>SIGNAL / 4663</span><strong>RESOLVED</strong></p>
        </div>
      )}

      <span className="resolver-field__coordinate resolver-field__coordinate--top">Y / 04663</span>
      <span className="resolver-field__coordinate resolver-field__coordinate--bottom">X / 04663</span>
    </div>
  );
}

function LockedNote() {
  return (
    <div className="resolver-lock">
      <span className="resolver-lock__mark" aria-hidden="true"><PatternMark compact /></span>
      <div>
        <strong>FIELD NOTE / LOCKED</strong>
        <span>Resolve the signal to open your observer record.</span>
      </div>
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

  const phaseCopy = [
    {
      label: "OBSERVE / 00",
      title: "DISTURB THE NOISE.",
      body: "Move the resolution control. Do not search for an answer yet—notice when randomness begins to organize.",
    },
    {
      label: "GROUP + COUNT / 01",
      title: "NAME WHAT REPEATS.",
      body: "The field has resolved into four groups. Count each group before moving to the pattern layer.",
    },
    {
      label: "COMPLETE THE LOOP / 02",
      title: "WHAT COMES NEXT?",
      body: "The second line repeats the first. Identify the missing interval to unlock the signal.",
    },
  ][phase];

  return (
    <div className="resolver" data-pattern-resolver="guided">
      <header className="resolver__statusbar">
        <p><span className="resolver__live-dot" aria-hidden="true" />GUIDED RESOLVER / 4663</p>
        <p>MODE / OBSERVATION</p>
        <p>{solved ? "SIGNAL / EARNED" : "FIELD NOTE / LOCKED"}</p>
      </header>

      <div className="resolver__body">
        <ol className="resolver__phases" aria-label="Resolver phases">
          {PHASES.map((name, index) => {
            const isCurrent = phase === index;
            const isComplete = index < phase || (index === 3 && solved);
            return (
              <li
                aria-current={isCurrent ? "step" : undefined}
                className={isCurrent ? "is-current" : isComplete ? "is-complete" : ""}
                key={name}
              >
                <span className="resolver__phase-number">{String(index).padStart(2, "0")}</span>
                <span className="resolver__phase-copy">
                  <strong>{name}</strong>
                  <small>{index === 3 && !solved ? "LOCKED" : isCurrent ? "ACTIVE" : isComplete ? "COMPLETE" : "PENDING"}</small>
                </span>
                <i aria-hidden="true">{isComplete ? "×" : "·"}</i>
              </li>
            );
          })}
        </ol>

        <div className="resolver__instrument">
          <ResolverField phase={phase} solved={solved} />

          <div className="resolver__control">
            <label htmlFor="pattern-resolution">
              <span>RESOLUTION</span>
              <output htmlFor="pattern-resolution">
                {String(phase).padStart(2, "0")} / {PHASES[phase]}
              </output>
            </label>
            <input
              aria-describedby="resolution-help"
              aria-valuetext={`${PHASES[phase]}, resolution ${phase} of ${solved ? 3 : 2}`}
              id="pattern-resolution"
              max={solved ? 3 : 2}
              min="0"
              onChange={(event) => setResolution(Number(event.currentTarget.value))}
              step="1"
              type="range"
              value={phase}
            />
            <div className="resolver__ticks" aria-hidden="true">
              <span>00</span><span>01</span><span>02</span>{solved && <span>03</span>}
            </div>
            <p className="sr-only" id="resolution-help">
              Move from noise to rule. At pattern, name the missing interval.
            </p>
          </div>
        </div>

        <aside
          className="resolver__context"
          aria-labelledby="resolver-context-title"
          data-field-note-state={solved ? "earned" : "locked"}
          data-manual-fallback={shareState === "failed" ? "available" : "inactive"}
        >
          {phase < 3 && phaseCopy && (
            <>
              <div className="resolver__context-copy">
                <p>{phaseCopy.label}</p>
                <h3 id="resolver-context-title">{phaseCopy.title}</h3>
                <span>{phaseCopy.body}</span>
              </div>

              {phase === 2 ? (
                <div className="resolver-quiz" data-resolver-quiz="missing-interval">
                  <p className="sr-only" id="resolver-full-problem">
                    The first sequence is 4, 6, 6, 3. What completes the repeating sequence
                    4, 6, 6, question mark?
                  </p>
                  <div className="resolver-quiz__reference" aria-hidden="true">
                    <span>REFERENCE</span><strong>04 / 06 / 06 / 03</strong>
                  </div>
                  <fieldset aria-describedby="resolver-full-problem">
                    <legend>WHAT COMPLETES THE LOOP?</legend>
                    <div>
                      {[3, 4, 6].map((value) => (
                        <button onClick={() => guess(value)} type="button" key={value}>
                          {String(value).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {attempts > 0 && (
                    <p className="resolver-quiz__attempts">ATTEMPTS / {String(attempts).padStart(2, "0")}</p>
                  )}
                  <p className="resolver__announcement" aria-live="polite" aria-atomic="true">
                    {resolverMessage}
                  </p>
                </div>
              ) : (
                <LockedNote />
              )}
            </>
          )}

          {phase === 3 && solved && (
            <div className="field-note">
              <div className="resolver__context-copy">
                <p>EARNED FIELD NOTE / 03</p>
                <h3 id="resolver-context-title">NAME YOUR LENS.</h3>
                <span>You did not create the pattern. You changed the resolution.</span>
              </div>

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
          )}
        </aside>
      </div>
    </div>
  );
}
