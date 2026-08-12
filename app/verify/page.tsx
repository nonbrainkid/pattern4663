import type { Metadata } from "next";
import Link from "next/link";
import { ContractCopy } from "../_components/ContractCopy";
import { PatternMark } from "../_components/PatternMark";
import { project, statusLabel } from "../_data/project";

const verifyUrl = new URL("/verify", project.canonicalUrl).href;

export const metadata: Metadata = {
  title: `Verify ${project.name} / $${project.symbol}`,
  description: `Canonical verification record for ${project.name} / $${project.symbol} on ${project.chainName} (${project.chainId}). Compare the full contract address before interacting.`,
  alternates: { canonical: verifyUrl },
  openGraph: {
    title: `Verify ${project.name} / $${project.symbol}`,
    description: `One token. One chain. One full contract address. Verify the canonical ${project.name} record.`,
    url: verifyUrl,
    type: "website",
  },
};

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

function VerifyLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="verify-label">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

export default function VerifyPage() {
  return (
    <div className="site-shell verify-shell" id="top">
      <a className="skip-link" href="#verify-main">
        Skip to verification record
      </a>

      <header className="site-header">
        <div className="site-header__inner page-width">
          <Link className="brand" href="/" aria-label={`${project.name}, return home`}>
            <PatternMark compact />
            <span className="brand__wordmark">{project.name}</span>
          </Link>
          <nav className="site-nav" aria-label="Verification navigation">
            <Link href="/">HOME</Link>
            <Link className="site-nav__verify" href="/verify" aria-current="page">
              VERIFY
            </Link>
            <a href={project.explorerUrl} {...externalLinkProps}>
              BLOCKSCOUT
            </a>
          </nav>
          <p className="site-header__signal">
            <span>CHAIN</span>
            <strong>{project.chainId}</strong>
          </p>
        </div>
      </header>

      <main id="verify-main">
        <section className="verify-hero" aria-labelledby="verify-title">
          <div className="verify-hero__inner page-width">
            <div className="verify-hero__copy">
              <VerifyLabel>CANONICAL VERIFICATION / REV 01</VerifyLabel>
              <h1 id="verify-title">
                VERIFY THE
                <span>FULL SIGNAL.</span>
              </h1>
              <p>
                One token. One chain. One full address. This page is the canonical
                verification record for {project.name} / ${project.symbol}.
              </p>
              <div className="verify-hero__equation" aria-label="Canonical verification formula">
                <span>DOMAIN</span>
                <i aria-hidden="true">×</i>
                <span>CHAIN</span>
                <i aria-hidden="true">×</i>
                <span>FULL CA</span>
                <i aria-hidden="true">=</i>
                <strong>CANONICAL</strong>
              </div>
            </div>
            <div className="verify-hero__mark" aria-hidden="true">
              <PatternMark />
              <p>IDENTITY FIELD / LOCKED</p>
            </div>
          </div>
        </section>

        <section className="verify-console" aria-labelledby="canonical-record-title">
          <div className="page-width">
            <div className="verify-console__frame">
              <div className="verify-console__statusbar">
                <p>
                  <span aria-hidden="true" /> IDENTITY / {statusLabel()}
                </p>
                <p>CANONICAL RECORD / PATTERN4663.COM</p>
                <p>NETWORK / {project.chainId}</p>
              </div>

              <div className="verify-console__body">
                <div className="verify-contract">
                  <VerifyLabel>FULL CONTRACT ADDRESS</VerifyLabel>
                  <h2 id="canonical-record-title">COMPARE EVERY CHARACTER.</h2>
                  <code>{project.contractAddress}</code>
                  <ContractCopy address={project.contractAddress} />
                  <noscript>
                    <p className="verify-contract__noscript">
                      JavaScript is unavailable. Select the full address printed above and copy it manually.
                    </p>
                  </noscript>
                </div>

                <div className="verify-identity">
                  <p className="verify-identity__head">ON-CHAIN IDENTITY / EXACT</p>
                  <dl>
                    <div>
                      <dt>TOKEN</dt>
                      <dd>{project.name} / {project.onchainName}</dd>
                    </div>
                    <div>
                      <dt>SYMBOL</dt>
                      <dd>{project.symbol}</dd>
                    </div>
                    <div>
                      <dt>NETWORK</dt>
                      <dd>{project.chainName}</dd>
                    </div>
                    <div>
                      <dt>CHAIN ID</dt>
                      <dd>{project.chainId}</dd>
                    </div>
                    <div>
                      <dt>STATUS</dt>
                      <dd className="verify-identity__live">{statusLabel()}</dd>
                    </div>
                    <div>
                      <dt>CANONICAL DOMAIN</dt>
                      <dd>
                        <a href={project.canonicalUrl}>{new URL(project.canonicalUrl).host}</a>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="verify-protocol section" aria-labelledby="verify-protocol-title">
          <div className="page-width">
            <VerifyLabel>THE THREE-PASS CHECK</VerifyLabel>
            <div className="verify-protocol__heading">
              <h2 id="verify-protocol-title">VERIFY IN THREE PASSES.</h2>
              <p>
                A shortened address is not proof. A familiar logo is not proof. All three values must agree.
              </p>
            </div>
            <ol className="verify-protocol__steps">
              <li>
                <span>01 / DOMAIN</span>
                <strong>{new URL(project.canonicalUrl).host}</strong>
                <p>Start from the canonical domain, typed or bookmarked by you.</p>
              </li>
              <li>
                <span>02 / CHAIN</span>
                <strong>{project.chainName} / {project.chainId}</strong>
                <p>Confirm the network and numeric chain ID before interacting.</p>
              </li>
              <li>
                <span>03 / FULL CA</span>
                <strong className="verify-protocol__address">{project.contractAddress}</strong>
                <p>Compare every character against the explorer. If one differs, stop.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="verify-endpoints section" aria-labelledby="verify-endpoints-title">
          <div className="page-width verify-endpoints__grid">
            <div>
              <VerifyLabel>OFFICIAL ENDPOINTS</VerifyLabel>
              <h2 id="verify-endpoints-title">FOLLOW THE RECORD, NOT THE REPLY.</h2>
              <p>These are the public surfaces referenced by the canonical PATTERN record.</p>
            </div>
            <div className="verify-endpoints__links">
              <a href={project.explorerUrl} {...externalLinkProps}>
                <span>01 / EXPLORER</span>
                <strong>VERIFY ON BLOCKSCOUT</strong>
                <i aria-hidden="true">↗</i>
              </a>
              <a href={project.launchUrl} {...externalLinkProps}>
                <span>02 / THIRD-PARTY VENUE</span>
                <strong>OPEN PONS LAUNCHPAD</strong>
                <i aria-hidden="true">↗</i>
              </a>
              <a href={project.xUrl} {...externalLinkProps}>
                <span>03 / CANONICAL SOCIAL</span>
                <strong>OPEN {project.xHandle.toUpperCase()}</strong>
                <i aria-hidden="true">↗</i>
              </a>
              <a href={project.canonicalUrl}>
                <span>04 / CANONICAL DOMAIN</span>
                <strong>RETURN TO {new URL(project.canonicalUrl).host.toUpperCase()}</strong>
                <i aria-hidden="true">→</i>
              </a>
            </div>
          </div>
        </section>

        <section className="verify-stop section" aria-labelledby="verify-stop-title">
          <div className="page-width verify-stop__grid">
            <div className="verify-stop__signal" aria-hidden="true">!</div>
            <div className="verify-stop__content">
              <VerifyLabel>ANTI-SCAM PROTOCOL</VerifyLabel>
              <h2 id="verify-stop-title">STOP IF ANY VALUE DIFFERS.</h2>
              <ul>
                <li>Never accept a contract address from a DM, reply, screenshot, or shortened snippet.</li>
                <li>Never connect a wallet just to verify a token.</li>
                <li>Verification never requires a signature, approval, transfer, or seed phrase.</li>
                <li>Compare the canonical domain, chain ID, and full address before interacting.</li>
              </ul>
              <p className="verify-stop__venue">
                pons is a third-party venue. Access and availability can depend on jurisdiction.
              </p>
            </div>
          </div>
        </section>

        <aside className="disclosure" aria-label="Risk disclosure">
          <div className="page-width disclosure__inner">
            <p className="disclosure__label">DISCLOSURE / READ BEFORE INTERACTING</p>
            <p>
              {project.disclosures.independence} {project.disclosures.marketRisk}{" "}
              {project.disclosures.verification}
            </p>
          </div>
        </aside>
      </main>

      <footer className="site-footer">
        <div className="page-width site-footer__inner">
          <Link className="brand" href="/" aria-label={`${project.name}, return home`}>
            <PatternMark compact />
            <span className="brand__wordmark">{project.name}</span>
          </Link>
          <Link className="site-footer__verify" href="/verify" aria-current="page">
            CANONICAL RECORD / VERIFY
          </Link>
          <p className="site-footer__chain">CHAIN / {project.chainId}</p>
        </div>
      </footer>
    </div>
  );
}
