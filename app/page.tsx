import type { CSSProperties } from "react";
import { PatternMark } from "./_components/PatternMark";
import { PatternAtlas } from "./_components/PatternAtlas";
import { SignalField } from "./_components/SignalField";

const LAB_NOISE = Array.from({ length: 36 }, (_, index) => {
  const column = index % 9;
  const row = Math.floor(index / 9);
  const offsetX = ((index * 17) % 11) - 5;
  const offsetY = ((index * 23) % 13) - 6;

  return {
    left: `${8 + column * 10.4}%`,
    top: `${20 + row * 19}%`,
    style: {
      "--scatter-x": `${offsetX * 2.1}px`,
      "--scatter-y": `${offsetY * 1.8}px`,
      "--delay": `${(index % 7) * 45}ms`,
    } as CSSProperties,
  };
});

const SEQUENCE = [4, 6, 6, 3, 4, 6, 6, 3, 4, 6, 6, 3];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

function NoiseDiagram() {
  return (
    <div className="lab-diagram noise-diagram" aria-hidden="true">
      <div className="noise-diagram__axis noise-diagram__axis--x" />
      <div className="noise-diagram__axis noise-diagram__axis--y" />
      {LAB_NOISE.map((dot, index) => (
        <span
          className={index === 22 ? "is-signal" : ""}
          key={`noise-${index}`}
          style={{ left: dot.left, top: dot.top, ...dot.style }}
        />
      ))}
    </div>
  );
}

function SequenceDiagram() {
  return (
    <div className="lab-diagram sequence-diagram" aria-hidden="true">
      <div className="sequence-diagram__bars">
        {SEQUENCE.map((value, index) => (
          <span
            className={index === 7 ? "is-signal" : ""}
            key={`sequence-${index}`}
            style={
              {
                "--bar-height": `${value * 10 + 12}%`,
                "--bar-delay": `${index * 70}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="sequence-diagram__digits">
        <span>4</span><span>6</span><span>6</span><span>3</span>
      </div>
    </div>
  );
}

function RecursionDiagram() {
  return (
    <div className="lab-diagram recursion-diagram" aria-hidden="true">
      <span className="recursion-diagram__frame recursion-diagram__frame--one" />
      <span className="recursion-diagram__frame recursion-diagram__frame--two" />
      <span className="recursion-diagram__frame recursion-diagram__frame--three" />
      <span className="recursion-diagram__frame recursion-diagram__frame--four" />
      <span className="recursion-diagram__signal" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="site-shell" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <div className="site-header__inner page-width">
          <a className="brand" href="#top" aria-label="PATTERN, back to top">
            <PatternMark compact />
            <span className="brand__wordmark">PATTERN</span>
          </a>

          <nav className="site-nav" aria-label="Primary navigation">
            <a href="#thesis">THESIS</a>
            <a href="#lab">LAB</a>
            <a href="#atlas">ATLAS</a>
            <a href="#origin">ORIGIN</a>
          </nav>

          <p className="site-header__signal">
            <span>SIGNAL</span>
            <strong>4663</strong>
          </p>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__inner page-width">
            <div className="hero__copy">
              <p className="hero__eyebrow">
                <span>PATTERN</span>
                <span>CHAIN 4663</span>
                <span>INDEPENDENT</span>
              </p>

              <h1 className="hero__title" id="hero-title">
                SEE THE
                <span>PATTERN.</span>
              </h1>

              <p className="hero__lead">
                Everything is noise until you see the pattern.
              </p>
              <p className="hero__sub">
                A culture coin for people who find structure in the chaos.
              </p>

              <div className="hero__actions" aria-label="Primary actions">
                <a className="action action--primary" href="#lab">
                  <span>ENTER THE LAB</span>
                  <span className="action__arrow" aria-hidden="true">↘</span>
                </a>
                <a className="action action--quiet" href="#signal">
                  <span>FOLLOW THE SIGNAL</span>
                  <span className="action__arrow" aria-hidden="true">→</span>
                </a>
              </div>

              <p className="status-chip">
                <span aria-hidden="true" />
                PRE-LAUNCH / CONTRACT NOT PUBLISHED
              </p>
            </div>

            <div className="hero__visual">
              <SignalField />
              <p className="hero__field-label hero__field-label--top">
                FIELD 01 / ACTIVE
              </p>
              <p className="hero__field-label hero__field-label--bottom">
                NOISE → STRUCTURE
              </p>
            </div>
          </div>
          <div className="hero__scroll-cue" aria-hidden="true">
            <span>SCROLL TO RESOLVE</span>
            <i />
          </div>
        </section>

        <section className="thesis section" id="thesis" aria-labelledby="thesis-title">
          <div className="page-width reveal">
            <SectionLabel>THE THESIS</SectionLabel>
            <div className="thesis__grid">
              <h2 className="section-title thesis__title" id="thesis-title">
                THE PATTERN WAS
                <span>ALWAYS THERE.</span>
              </h2>

              <div className="thesis__content">
                <div className="thesis__statements">
                  <p><span>01</span>Crowds repeat.</p>
                  <p><span>02</span>Markets rhyme.</p>
                  <p><span>03</span>Code records the trace.</p>
                </div>
                <p className="thesis__body">
                  Stay with the noise long enough and structure appears.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lab section" id="lab" aria-labelledby="lab-title">
          <div className="page-width">
            <div className="lab__heading reveal">
              <div>
                <SectionLabel>PATTERN LAB</SectionLabel>
                <h2 className="section-title" id="lab-title">ORDER IN PLAIN SIGHT.</h2>
              </div>
              <p>
                Not decoration. Three small proofs that order can hide in plain sight.
              </p>
            </div>

            <div className="lab__grid">
              <article className="lab-card">
                <header className="lab-card__header">
                  <p><span>01 /</span> NOISE FIELD</p>
                  <span className="lab-card__state">ACTIVE</span>
                </header>
                <NoiseDiagram />
                <p className="lab-card__copy">
                  Move. Disturb the field. Watch it return to form.
                </p>
              </article>

              <article className="lab-card">
                <header className="lab-card__header">
                  <p><span>02 /</span> SEQUENCE 4663</p>
                  <span className="lab-card__state">LOOP</span>
                </header>
                <SequenceDiagram />
                <p className="lab-card__copy">
                  A deterministic rhythm built from one number.
                </p>
              </article>

              <article className="lab-card">
                <header className="lab-card__header">
                  <p><span>03 /</span> RECURSION</p>
                  <span className="lab-card__state">∞</span>
                </header>
                <RecursionDiagram />
                <p className="lab-card__copy">
                  Every solved pattern reveals another layer.
                </p>
              </article>
            </div>
          </div>
        </section>

        <PatternAtlas />

        <section className="origin section" id="origin" aria-labelledby="origin-title">
          <div className="page-width origin__grid reveal">
            <div className="origin__intro">
              <SectionLabel>ORIGIN</SectionLabel>
              <h2 className="section-title" id="origin-title">
                DESIGNED FOR
                <span>CHAIN 4663.</span>
              </h2>
              <p>
                No mystery addresses. The canonical contract will appear here and on
                the official account at launch.
              </p>
            </div>

            <div className="origin__record">
              <div className="origin__record-head">
                <span>NETWORK RECORD</span>
                <span>REV / 00</span>
              </div>
              <dl>
                <div><dt>NETWORK</dt><dd>ROBINHOOD CHAIN</dd></div>
                <div><dt>CHAIN ID</dt><dd className="origin__number">4663</dd></div>
                <div><dt>STATUS</dt><dd><span className="record-status">PRE-LAUNCH</span></dd></div>
                <div><dt>CONTRACT</dt><dd className="origin__muted">NOT PUBLISHED</dd></div>
              </dl>
              <p className="origin__checksum" aria-hidden="true">
                VERIFY_SOURCE / VERIFY_CHAIN / VERIFY_ADDRESS
              </p>
            </div>
          </div>
        </section>

        <section className="signal-cta section" id="signal" aria-labelledby="signal-title">
          <div className="signal-cta__field" aria-hidden="true">
            <PatternMark />
          </div>
          <div className="page-width signal-cta__inner reveal">
            <SectionLabel>SIGNAL / 4663</SectionLabel>
            <h2 className="signal-cta__title" id="signal-title">
              ONE SIGNAL.
              <span>ONE CONTRACT.</span>
            </h2>
            <p>
              Follow the project account. Verify the address. Then decide for yourself.
            </p>
            <div className="signal-cta__actions">
              <button
                className="action action--primary action--pending"
                disabled
                type="button"
              >
                <span>ACCOUNT LINK PENDING</span>
                <span className="action__arrow" aria-hidden="true">··</span>
              </button>
              <span className="action action--disabled" aria-disabled="true">
                CONTRACT NOT LIVE
              </span>
            </div>
          </div>
        </section>

        <aside className="disclosure" aria-label="Risk disclosure">
          <div className="page-width disclosure__inner">
            <p className="disclosure__label">DISCLOSURE / READ BEFORE INTERACTING</p>
            <p>
              PATTERN is an independent community project. Not affiliated with or
              endorsed by Robinhood Markets, Inc. No promise of profit, utility, or
              listing. Crypto assets are risky. Verify the canonical contract address
              before interacting.
            </p>
          </div>
        </aside>
      </main>

      <footer className="site-footer">
        <div className="page-width site-footer__inner">
          <a className="brand" href="#top" aria-label="PATTERN, back to top">
            <PatternMark compact />
            <span className="brand__wordmark">PATTERN</span>
          </a>
          <p>SEE STRUCTURE. VERIFY EVERYTHING.</p>
          <p className="site-footer__chain">CHAIN / 4663</p>
        </div>
      </footer>
    </div>
  );
}
