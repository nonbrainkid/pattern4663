import { PatternAtlas } from "./_components/PatternAtlas";
import { PatternLab } from "./_components/PatternLab";
import { PatternMark } from "./_components/PatternMark";
import { SignalField } from "./_components/SignalField";
import { contractLabel, project, statusLabel } from "./_data/project";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

export default function Home() {
  const chainName = project.chainName.toUpperCase();

  return (
    <div className="site-shell" id="top">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header">
        <div className="site-header__inner page-width">
          <a className="brand" href="#top" aria-label={`${project.name}, back to top`}>
            <PatternMark compact />
            <span className="brand__wordmark">{project.name}</span>
          </a>
          <nav className="site-nav" aria-label="Primary navigation">
            <a href="#belief">BELIEF</a>
            <a href="#lab">LAB</a>
            <a href="#atlas">ATLAS</a>
            <a href="#origin">ORIGIN</a>
          </nav>
          <p className="site-header__signal"><span>SIGNAL</span><strong>{project.chainId}</strong></p>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__inner page-width">
            <div className="hero__copy">
              <p className="hero__eyebrow">
                <span>PRE-LAUNCH</span>
                <span>{project.name} / ${project.symbol}</span>
                <span>CHAIN {project.chainId}</span>
                <span>INDEPENDENT</span>
              </p>
              <h1 className="hero__title" id="hero-title">LOOK BENEATH<span>THE NOISE.</span></h1>
              <p className="hero__lead">The world becomes recognizable through patterns.</p>
              <p className="hero__sub">
                Mathematics gives those patterns a language. PATTERN / ${project.symbol} is the
                culture coin—and shared signal—for people who look twice.
              </p>
              <div className="hero__actions" aria-label="Primary actions">
                <a className="action action--primary" href="#lab">
                  <span>TEST THE PATTERN</span><span className="action__arrow" aria-hidden="true">↘</span>
                </a>
                <a className="action action--quiet" href={project.xUrl ?? "#signal"}
                  {...(project.xUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <span>{project.xHandle ? `FOLLOW ${project.xHandle.toUpperCase()}` : "FOLLOW THE SIGNAL"}</span>
                  <span className="action__arrow" aria-hidden="true">→</span>
                </a>
              </div>
              <p className="status-chip"><span aria-hidden="true" />{statusLabel()} / CONTRACT {contractLabel()}</p>
            </div>
            <div className="hero__visual">
              <SignalField />
              <p className="hero__field-label hero__field-label--top">PERCEPTION FIELD / ACTIVE</p>
              <p className="hero__field-label hero__field-label--bottom">NOISE → STRUCTURE</p>
            </div>
          </div>
          <div className="hero__scroll-cue" aria-hidden="true"><span>SCROLL TO RESOLVE</span><i /></div>
        </section>

        <section className="belief section" id="belief" aria-labelledby="belief-title">
          <div className="page-width reveal">
            <SectionLabel>THE BELIEF</SectionLabel>
            <div className="belief__grid">
              <h2 className="section-title belief__title" id="belief-title">RECOGNITION HAS<span>A STRUCTURE.</span></h2>
              <div className="belief__content">
                <ol className="belief__steps">
                  <li><span>01</span><div><strong>NOTICE</strong><p>Before a system is understood, it looks like noise. Repetition is the first clue.</p></div></li>
                  <li><span>02</span><div><strong>EXPRESS</strong><p>A pattern becomes legible when it can be described: as a ratio, interval, sequence, distribution, or rule.</p></div></li>
                  <li><span>03</span><div><strong>SIGNAL</strong><p>PATTERN turns that habit of looking beneath the surface into a shared cultural signal.</p></div></li>
                </ol>
                <p className="belief__close">Not prophecy. Not certainty. A way of seeing—and the discipline to test it.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lab section" id="lab" aria-labelledby="lab-title">
          <div className="page-width">
            <div className="lab__heading reveal">
              <div>
                <SectionLabel>PATTERN LAB / INTERACTIVE</SectionLabel>
                <h2 className="section-title" id="lab-title">DON&apos;T TAKE THE CLAIM<span>ON FAITH.</span></h2>
              </div>
              <p>
                Don&apos;t accept the thesis. Resolve it yourself. Move from noise to rule, then name the
                missing interval. The point is not to predict an outcome. It is to feel the moment a rule becomes visible.
              </p>
            </div>
            <PatternLab />
          </div>
        </section>

        <section className="bridge section" aria-labelledby="bridge-title">
          <div className="page-width bridge__grid reveal">
            <div>
              <SectionLabel>ONE INSTINCT / FOUR SYSTEMS</SectionLabel>
              <h2 className="section-title" id="bridge-title">DIFFERENT SURFACES.<span>THE SAME SEARCH.</span></h2>
            </div>
            <div className="bridge__copy">
              <p>A sunflower distributes growth through repeated angles. Code turns compact rules into repeatable behavior. Chess compresses an entire position into one forced geometry. Markets produce recurring shapes because people and mechanisms repeat—but the same shape does not guarantee the same outcome.</p>
              <p>PATTERN is about the discipline of finding structure, naming it precisely, and knowing where the pattern ends.</p>
            </div>
          </div>
        </section>

        <PatternAtlas />

        <section className="manifesto section" aria-labelledby="manifesto-title">
          <div className="page-width manifesto__inner reveal">
            <SectionLabel>THE MANIFESTO</SectionLabel>
            <h2 className="section-title" id="manifesto-title">LOOK TWICE.<span>TEST WHAT YOU SEE.</span></h2>
            <p>Noise is infinite. Attention is finite. Patterns are how the world becomes legible—and mathematics is how intuition is forced to explain itself. PATTERN / ${project.symbol} is for people who look twice, test what they think they see, and refuse to confuse a recurring shape with a guaranteed future. The pattern was already there. The signal is choosing to see it.</p>
          </div>
        </section>

        <section className="origin section" id="origin" aria-labelledby="origin-title">
          <div className="page-width origin__grid reveal">
            <div className="origin__intro">
              <SectionLabel>ORIGIN / CHAIN {project.chainId}</SectionLabel>
              <h2 className="section-title" id="origin-title">A CULTURAL SIGNAL,<span>AN ON-CHAIN RECORD.</span></h2>
              <p>PATTERN / ${project.symbol} is independently designed for Robinhood Chain. The token is not live. No contract address is canonical until it appears here, on {project.xHandle}, and on the chain {project.chainId} explorer.</p>
            </div>
            <div className="origin__record">
              <div className="origin__record-head"><span>NETWORK RECORD</span><span>REV / 00</span></div>
              <dl>
                <div><dt>NETWORK</dt><dd>{chainName}</dd></div>
                <div><dt>CHAIN ID</dt><dd className="origin__number">{project.chainId}</dd></div>
                <div><dt>SYMBOL</dt><dd>{project.symbol}</dd></div>
                <div><dt>STATUS</dt><dd><span className="record-status">{statusLabel()}</span></dd></div>
                <div><dt>CONTRACT</dt><dd className="origin__muted">{contractLabel()}</dd></div>
              </dl>
              <p className="origin__checksum">VERIFY DOMAIN / VERIFY CHAIN / VERIFY FULL ADDRESS</p>
            </div>
          </div>
        </section>

        <section className="signal-cta section" id="signal" aria-labelledby="signal-title">
          <div className="signal-cta__field" aria-hidden="true"><PatternMark /></div>
          <div className="page-width signal-cta__inner reveal">
            <SectionLabel>SIGNAL / {project.chainId}</SectionLabel>
            <h2 className="signal-cta__title" id="signal-title">IF YOU LOOK TWICE,<span>THIS IS YOUR SIGNAL.</span></h2>
            <p>Follow the canonical account for PATTERN / ${project.symbol}. At launch, verify every character of the contract before interacting. Ignore DMs, reply addresses, and unofficial links.</p>
            <div className="signal-cta__actions">
              <a className="action action--primary" href={project.xUrl ?? "#top"}
                {...(project.xUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <span>FOLLOW {project.xHandle ?? project.name}</span><span className="action__arrow" aria-hidden="true">→</span>
              </a>
              <a className="action action--quiet" href="#atlas">RETURN TO THE ATLAS</a>
              <span className="signal-cta__pending">PRE-LAUNCH / CONTRACT NOT PUBLISHED</span>
            </div>
          </div>
        </section>

        <aside className="disclosure" aria-label="Risk disclosure">
          <div className="page-width disclosure__inner">
            <p className="disclosure__label">DISCLOSURE / READ BEFORE INTERACTING</p>
            <p>{project.disclosures.independence} {project.disclosures.marketRisk} {project.disclosures.verification}</p>
          </div>
        </aside>
      </main>

      <footer className="site-footer">
        <div className="page-width site-footer__inner">
          <a className="brand" href="#top" aria-label={`${project.name}, back to top`}><PatternMark compact /><span className="brand__wordmark">{project.name}</span></a>
          <p>LOOK TWICE. VERIFY EVERYTHING.</p>
          <p className="site-footer__chain">CHAIN / {project.chainId}</p>
        </div>
      </footer>
    </div>
  );
}
