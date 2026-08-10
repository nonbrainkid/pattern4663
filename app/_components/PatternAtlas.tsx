"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const GOLDEN_ANGLE = 137.507764;
const PHYLLOTAXIS_SEEDS = Array.from({ length: 89 }, (_, index) => {
  const angle = (index * GOLDEN_ANGLE * Math.PI) / 180;
  const radius = Math.sqrt(index / 88) * 43;

  return {
    index,
    left: 50 + Math.cos(angle) * radius,
    top: 50 + Math.sin(angle) * radius,
    size: 2.7 + (index / 88) * 2.8,
    opacity: 0.32 + (index / 88) * 0.62,
  };
});

const TAYLOR_DEGREES = [1, 3, 5, 7] as const;
type TaylorDegree = (typeof TAYLOR_DEGREES)[number];

const TAYLOR_EQUATIONS: Record<
  TaylorDegree,
  { accessible: string; display: string }
> = {
  1: {
    accessible: "sine of x is approximately x",
    display: "sin(x) ≈ x",
  },
  3: {
    accessible: "sine of x is approximately x minus x cubed over three factorial",
    display: "sin(x) ≈ x − x³/3!",
  },
  5: {
    accessible: "sine of x is approximately x minus x cubed over three factorial, plus x to the fifth over five factorial",
    display: "sin(x) ≈ x − x³/3! + x⁵/5!",
  },
  7: {
    accessible: "sine of x is approximately x minus x cubed over three factorial, plus x to the fifth over five factorial, minus x to the seventh over seven factorial",
    display: "sin(x) ≈ x − x³/3! + x⁵/5! − x⁷/7!",
  },
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const CHESS_PIECES: Record<string, { glyph: string; label: string }> = {
  g8: { glyph: "♚", label: "black king" },
  f7: { glyph: "♟", label: "black pawn" },
  g7: { glyph: "♟", label: "black pawn" },
  h7: { glyph: "♟", label: "black pawn" },
  e1: { glyph: "♖", label: "white rook" },
  g1: { glyph: "♔", label: "white king" },
};

const MICRO_EXAMPLES = [
  ["HEARTBEAT", "rhythm exposes deviation", "INTERVAL / PHASE"],
  ["SEASONS", "cycles return, never identically", "CYCLE / 365.2422 DAYS"],
  ["LANGUAGE", "grammar compresses meaning", "FREQUENCY / ZIPF"],
  ["MUSIC", "repetition creates expectation", "RHYTHM / 4:3 → 12"],
  ["CODE", "loops turn rules into behavior", "COMPRESSION / REPEATED STRINGS"],
  ["NETWORKS", "local links form global shape", "DISTRIBUTION / HEAVY TAILS"],
  ["CITIES", "movement carves recurring paths", "TRAFFIC / SHOCKWAVES"],
  ["CROWDS", "behavior clusters under pressure", "CLUSTER / PRESSURE"],
] as const;

type CanvasSize = {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
};

function prepareCanvas(canvas: HTMLCanvasElement): CanvasSize | null {
  const context = canvas.getContext("2d");
  if (!context) return null;

  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  return { context, width, height };
}

function taylorSin(x: number, degree: TaylorDegree) {
  let result = x;
  if (degree >= 3) result -= x ** 3 / 6;
  if (degree >= 5) result += x ** 5 / 120;
  if (degree >= 7) result -= x ** 7 / 5040;
  return result;
}

function drawTaylorChart(canvas: HTMLCanvasElement, degree: TaylorDegree) {
  const prepared = prepareCanvas(canvas);
  if (!prepared) return;

  const { context, width, height } = prepared;
  const inset = { top: 24, right: 18, bottom: 32, left: 34 };
  const plotWidth = Math.max(1, width - inset.left - inset.right);
  const plotHeight = Math.max(1, height - inset.top - inset.bottom);
  const xMin = -Math.PI;
  const xMax = Math.PI;
  const yMin = -2;
  const yMax = 2;
  const mapX = (value: number) =>
    inset.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
  const mapY = (value: number) =>
    inset.top + ((yMax - value) / (yMax - yMin)) * plotHeight;

  context.lineWidth = 1;
  context.strokeStyle = "rgba(40, 49, 59, 0.72)";
  for (let index = 0; index <= 8; index += 1) {
    const x = inset.left + (plotWidth * index) / 8;
    context.beginPath();
    context.moveTo(x, inset.top);
    context.lineTo(x, inset.top + plotHeight);
    context.stroke();
  }
  for (let index = 0; index <= 4; index += 1) {
    const y = inset.top + (plotHeight * index) / 4;
    context.beginPath();
    context.moveTo(inset.left, y);
    context.lineTo(inset.left + plotWidth, y);
    context.stroke();
  }

  context.strokeStyle = "rgba(136, 147, 159, 0.8)";
  context.beginPath();
  context.moveTo(inset.left, mapY(0));
  context.lineTo(inset.left + plotWidth, mapY(0));
  context.moveTo(mapX(0), inset.top);
  context.lineTo(mapX(0), inset.top + plotHeight);
  context.stroke();

  const drawCurve = (
    sample: (x: number) => number,
    color: string,
    lineWidth: number,
  ) => {
    context.beginPath();
    for (let index = 0; index <= 320; index += 1) {
      const x = xMin + ((xMax - xMin) * index) / 320;
      const pointX = mapX(x);
      const pointY = mapY(sample(x));
      if (index === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    }
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
  };

  context.save();
  context.beginPath();
  context.rect(inset.left, inset.top, plotWidth, plotHeight);
  context.clip();
  drawCurve(Math.sin, "rgba(57, 217, 255, 0.96)", 2.25);
  drawCurve(
    (x) => taylorSin(x, degree),
    "rgba(242, 239, 231, 0.94)",
    1.7,
  );
  context.restore();

  context.fillStyle = "#39d9ff";
  context.beginPath();
  context.arc(mapX(0), mapY(0), 3.2, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(136, 147, 159, 0.9)";
  context.font = "10px monospace";
  context.fillText("−π", inset.left - 4, height - 10);
  context.fillText("0", mapX(0) - 3, height - 10);
  context.fillText("π", inset.left + plotWidth - 4, height - 10);
}

function syntheticCurve(curveIndex: number, progress: number) {
  const offset = curveIndex * 0.47;
  const firstPulse = Math.exp(-((progress - (0.18 + curveIndex * 0.012)) ** 2) / 0.0038);
  const secondPulse = Math.exp(-((progress - (0.53 - curveIndex * 0.008)) ** 2) / 0.013);
  const decay = Math.exp(-progress * (1.32 + curveIndex * 0.09));
  const rhythm = Math.sin(progress * Math.PI * (5.1 + curveIndex * 0.32) + offset);
  const fineRhythm = Math.sin(progress * Math.PI * 16 + curveIndex * 1.2);

  return decay * 0.46 + firstPulse * (0.4 - curveIndex * 0.022)
    + secondPulse * (0.18 + curveIndex * 0.012)
    + rhythm * 0.065 + fineRhythm * 0.018;
}

function drawMarketChart(canvas: HTMLCanvasElement) {
  const prepared = prepareCanvas(canvas);
  if (!prepared) return;

  const { context, width, height } = prepared;
  const inset = { top: 22, right: 16, bottom: 31, left: 24 };
  const plotWidth = Math.max(1, width - inset.left - inset.right);
  const plotHeight = Math.max(1, height - inset.top - inset.bottom);
  const colors = [
    "rgba(242, 239, 231, 0.88)",
    "rgba(136, 147, 159, 0.72)",
    "rgba(136, 147, 159, 0.54)",
    "rgba(136, 147, 159, 0.38)",
    "rgba(136, 147, 159, 0.26)",
  ];

  context.strokeStyle = "rgba(40, 49, 59, 0.74)";
  context.lineWidth = 1;
  for (let index = 0; index <= 6; index += 1) {
    const x = inset.left + (plotWidth * index) / 6;
    context.beginPath();
    context.moveTo(x, inset.top);
    context.lineTo(x, inset.top + plotHeight);
    context.stroke();
  }
  for (let index = 0; index <= 4; index += 1) {
    const y = inset.top + (plotHeight * index) / 4;
    context.beginPath();
    context.moveTo(inset.left, y);
    context.lineTo(inset.left + plotWidth, y);
    context.stroke();
  }

  for (let curveIndex = colors.length - 1; curveIndex >= 0; curveIndex -= 1) {
    const samples = Array.from({ length: 181 }, (_, index) =>
      syntheticCurve(curveIndex, index / 180),
    );
    let minimum = Infinity;
    let maximum = -Infinity;
    for (const sample of samples) {
      minimum = Math.min(minimum, sample);
      maximum = Math.max(maximum, sample);
    }
    const span = Math.max(0.0001, maximum - minimum);

    context.beginPath();
    for (let index = 0; index < samples.length; index += 1) {
      const normalized = (samples[index] - minimum) / span;
      const x = inset.left + (plotWidth * index) / (samples.length - 1);
      const y = inset.top + (1 - normalized) * plotHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = colors[curveIndex];
    context.lineWidth = curveIndex === 0 ? 1.8 : 1.1;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
  }

  const referenceX = inset.left + plotWidth * 0.53;
  context.setLineDash([3, 6]);
  context.strokeStyle = "rgba(57, 217, 255, 0.82)";
  context.beginPath();
  context.moveTo(referenceX, inset.top);
  context.lineTo(referenceX, inset.top + plotHeight);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = "rgba(136, 147, 159, 0.88)";
  context.font = "10px monospace";
  context.fillText("NORMALIZED PHASE", inset.left, height - 9);
  context.textAlign = "right";
  context.fillText("SHAPE / NOT SCALE", width - inset.right, height - 9);
  context.textAlign = "left";
}

function TaylorPlot({ degree }: { degree: TaylorDegree }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => drawTaylorChart(canvas, degree);
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    draw();

    return () => resizeObserver.disconnect();
  }, [degree]);

  return (
    <figure className="atlas-plot">
      <div className="atlas-plot__frame">
        <canvas aria-hidden="true" ref={canvasRef} />
      </div>
      <figcaption className="atlas-plot__caption">
        <span><i className="atlas-key atlas-key--cyan" />TRUE SIGNAL / sin(x)</span>
        <span><i className="atlas-key atlas-key--bone" />APPROXIMATION / DEGREE {degree}</span>
      </figcaption>
      <p className="sr-only">
        A graph from negative pi to pi. The cyan line is sin(x). The Bone line is
        the degree {degree} Taylor approximation centered at x equals zero.
      </p>
    </figure>
  );
}

function MarketPlot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => drawMarketChart(canvas);
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    draw();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <figure className="atlas-plot atlas-plot--market">
      <div className="atlas-plot__frame">
        <canvas aria-hidden="true" ref={canvasRef} />
      </div>
      <figcaption className="atlas-plot__caption">
        SYNTHETIC / NOT MARKET DATA / FIVE NORMALIZED TRAJECTORIES
      </figcaption>
      <p className="sr-only">
        Five deterministic synthetic curves are normalized and layered to show how
        visually similar phases can still diverge. They are not observations or prices.
      </p>
    </figure>
  );
}

function PhyllotaxisPlot() {
  return (
    <figure className="phyllotaxis">
      <div
        className="phyllotaxis__field"
        aria-hidden="true"
      >
        <span className="phyllotaxis__axis phyllotaxis__axis--x" />
        <span className="phyllotaxis__axis phyllotaxis__axis--y" />
        {PHYLLOTAXIS_SEEDS.map((seed) => (
          <i
            className={seed.index === 55
              ? "phyllotaxis__seed phyllotaxis__seed--signal"
              : "phyllotaxis__seed"}
            key={seed.index}
            style={
              {
                "--seed-left": `${seed.left}%`,
                "--seed-top": `${seed.top}%`,
                "--seed-size": `${seed.size}px`,
                "--seed-order": seed.index,
                "--seed-opacity": seed.opacity,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <figcaption>
        89 deterministic seed positions / each new point turns by the same angle
      </figcaption>
    </figure>
  );
}

function ChessBoard({ revealed }: { revealed: boolean }) {
  return (
    <div className="chess-study">
      <div
        aria-label={revealed
          ? "Chess position after rook to e8: checkmate against the black king on g8."
          : "Chess position, white to move: white rook e1 and king g1; black king g8 and pawns f7, g7, h7."}
        className={revealed ? "chess-board is-revealed" : "chess-board"}
        role="img"
      >
        {RANKS.map((rank) => (
          <div className="chess-board__row" key={rank}>
            {FILES.map((file) => {
              const coordinate = `${file}${rank}`;
              const piece = revealed && coordinate === "e1"
                ? undefined
                : revealed && coordinate === "e8"
                  ? { glyph: "♖", label: "white rook" }
                  : CHESS_PIECES[coordinate];
              const isPath = file === "e";
              const classNames = [
                "chess-board__square",
                isPath ? "is-move-path" : "",
                coordinate === "e1" ? "is-move-start" : "",
                coordinate === "e8" ? "is-move-target" : "",
              ].filter(Boolean).join(" ");

              return (
                <div
                  className={classNames}
                  data-file={file}
                  data-rank={rank}
                  key={coordinate}
                >
                  {piece ? (
                    <span
                      aria-hidden="true"
                      className={piece.label.startsWith("black")
                        ? "chess-board__piece--black"
                        : undefined}
                    >
                      {piece.glyph}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AtlasSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

export function PatternAtlas() {
  const [degree, setDegree] = useState<TaylorDegree>(7);
  const [moveRevealed, setMoveRevealed] = useState(false);

  return (
    <section className="atlas section" id="atlas" aria-labelledby="atlas-title">
      <div className="page-width">
        <header className="atlas__masthead reveal">
          <div>
            <AtlasSectionLabel>PATTERN ATLAS / FIELD NOTES</AtlasSectionLabel>
            <h2 className="section-title atlas__title" id="atlas-title">
              ORDER HIDES EVERYWHERE.
            </h2>
          </div>
          <p className="atlas__intro">
            From petals to polynomials, from positions to price charts: patterns
            compress complexity into something we can see.
          </p>
        </header>

        <div className="atlas__body">
          <aside className="atlas__rail" aria-label="Pattern Atlas modules">
            <p>FIELD INDEX</p>
            <ol>
              <li><a href="#atlas-golden"><span>01</span>GROWTH</a></li>
              <li><a href="#atlas-taylor"><span>02</span>CURVE</a></li>
              <li><a href="#atlas-chess"><span>03</span>POSITION</a></li>
              <li><a href="#atlas-market"><span>04</span>ECHO</a></li>
            </ol>
          </aside>

          <div className="atlas__modules">
            <article className="atlas-module atlas-module--golden" id="atlas-golden">
              <header className="atlas-module__header">
                <p><span>01 /</span> NATURAL DISTRIBUTION</p>
                <span>89 SEEDS</span>
              </header>
              <div className="atlas-module__golden-grid">
                <PhyllotaxisPlot />
                <div className="atlas-module__copy">
                  <p className="atlas-module__eyebrow">GOLDEN ANGLE / PHYLLOTAXIS</p>
                  <h3>ONE TURN.<br />ROOM FOR THE NEXT.</h3>
                  <dl className="atlas-metrics">
                    <div><dt>φ</dt><dd>1.6180339887</dd></div>
                    <div><dt>ANGLE</dt><dd>137.507764°</dd></div>
                  </dl>
                  <div className="golden-formula" aria-label="Golden ratio and golden angle formula">
                    <p>φ = (1 + √5) / 2</p>
                    <p>θ = 360° / φ² ≈ 137.507764°</p>
                  </div>
                  <p>
                    A repeated turn distributes new growth through available space.
                    Not a magic law — a recurring solution to packing and exposure.
                  </p>
                  <p className="golden-caveat">
                    Some plants approximate it; nature does not obey φ as a universal
                    commandment.
                  </p>
                </div>
              </div>
            </article>

            <article className="atlas-module atlas-module--taylor" id="atlas-taylor">
              <header className="atlas-module__header">
                <p><span>02 /</span> APPROXIMATION STUDY</p>
                <span>CENTER / x = 0</span>
              </header>
              <div className="atlas-module__taylor-intro">
                <div>
                  <p className="atlas-module__eyebrow">TAYLOR / LOCAL TRUTH</p>
                  <h3>BUILD THE CURVE<br />ONE TERM AT A TIME.</h3>
                </div>
                <p>
                  Near one point, derivatives turn a curve into a polynomial. Add
                  terms and the local pattern resolves farther.
                </p>
              </div>

              <div className="taylor-control">
                <label htmlFor="taylor-degree">POLYNOMIAL DEGREE</label>
                <input
                  aria-valuetext={`Degree ${degree}`}
                  id="taylor-degree"
                  max={TAYLOR_DEGREES.length - 1}
                  min={0}
                  onChange={(event) => {
                    const next = TAYLOR_DEGREES[Number(event.currentTarget.value)];
                    setDegree(next);
                  }}
                  step={1}
                  type="range"
                  value={TAYLOR_DEGREES.indexOf(degree)}
                />
                <div className="taylor-control__scale" aria-hidden="true">
                  {TAYLOR_DEGREES.map((value) => <span key={value}>{value}</span>)}
                </div>
                <output htmlFor="taylor-degree">DEGREE / {degree}</output>
              </div>

              <TaylorPlot degree={degree} />
              <p
                aria-label={TAYLOR_EQUATIONS[degree].accessible}
                className="taylor-equation"
              >
                {TAYLOR_EQUATIONS[degree].display}
              </p>
            </article>

            <article className="atlas-module atlas-module--chess" id="atlas-chess">
              <header className="atlas-module__header">
                <p><span>03 /</span> FORCED GEOMETRY</p>
                <span>WHITE TO MOVE</span>
              </header>
              <div className="atlas-module__chess-grid">
                <div className="atlas-module__copy">
                  <p className="atlas-module__eyebrow">CHESS / POSITIONAL PATTERN</p>
                  <h3>THE BOARD CLOSES.<br />ONE FILE OPENS.</h3>
                  <p>
                    The back rank is sealed by its own pawns. The open e-file turns
                    geometry into mate.
                  </p>
                  <button
                    aria-controls="chess-move-result"
                    aria-pressed={moveRevealed}
                    className="atlas-reveal"
                    onClick={() => setMoveRevealed((current) => !current)}
                    type="button"
                  >
                    <span>{moveRevealed ? "HIDE THE MOVE" : "REVEAL THE MOVE"}</span>
                    <span aria-hidden="true">
                      {moveRevealed ? "E8 → E1" : "E1 → E8"}
                    </span>
                  </button>
                  <p
                    aria-live="polite"
                    className="chess-result"
                    hidden={!moveRevealed}
                    id="chess-move-result"
                  >
                    <strong>Re8#</strong>
                    <span>CHECKMATE / FORCED</span>
                  </p>
                </div>
                <ChessBoard revealed={moveRevealed} />
              </div>
            </article>

            <article className="atlas-module atlas-module--market" id="atlas-market">
              <header className="atlas-module__header">
                <p><span>04 /</span> RESEARCH PROTOCOL</p>
                <span>SYNTHETIC CURVES</span>
              </header>
              <div className="market-warning">ILLUSTRATIVE / NOT MARKET DATA</div>
              <div className="atlas-module__market-grid">
                <div>
                  <p className="atlas-module__eyebrow">MARKET ECHO / PATTERN INDEX</p>
                  <h3>CHARTS REPEAT SHAPES. OUTCOMES DO NOT REPEAT ON COMMAND.</h3>
                  <p className="market-hypothesis">
                    Token launches may share measurable structures in attention,
                    liquidity and retention. That is a hypothesis to test — not a promise.
                  </p>
                  <MarketPlot />
                </div>

                <div className="research-record">
                  <p className="research-record__title">RESEARCH RECORD</p>
                  <dl>
                    <div><dt>STATUS</dt><dd>PROTOCOL DRAFT</dd></div>
                    <div><dt>INDEX</dt><dd>PROTOCOL 00</dd></div>
                    <div><dt>UNIVERSE</dt><dd>NOT LOCKED</dd></div>
                    <div><dt>DATASET</dt><dd>NOT PUBLISHED</dd></div>
                    <div><dt>SUCCESS RULE</dt><dd>NOT DEFINED</dd></div>
                    <div><dt>OUT-OF-SAMPLE</dt><dd>REQUIRED</dd></div>
                    <div><dt>RESULT</dt><dd>NOT CLAIMED</dd></div>
                  </dl>
                  <p className="research-record__close">
                    When we make the claim, the data and method ship with it.
                  </p>
                  <p className="market-caveat">PATTERN FOUND ≠ FUTURE GUARANTEED</p>
                  <p className="research-record__footer">METHODOLOGY BEFORE CONCLUSIONS</p>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="atlas-micro" aria-labelledby="atlas-micro-title">
          <p id="atlas-micro-title">FIELD NOTES / 08 SMALL SIGNALS</p>
          <ul>
            {MICRO_EXAMPLES.map(([label, meaning, note], index) => (
              <li key={label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p><strong>{label}</strong>{meaning}</p>
                <small>{note}</small>
              </li>
            ))}
          </ul>
        </div>

        <blockquote className="atlas-pullquote">
          <span aria-hidden="true">“</span>
          THE SHAPE REPEATS. THE OUTCOME REMAINS OPEN.
        </blockquote>
      </div>
    </section>
  );
}
