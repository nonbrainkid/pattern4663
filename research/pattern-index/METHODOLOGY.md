# PATTERN INDEX v0 pre-registration draft

Status: **protocol draft; not locked; no real labels collected; no result claimed**.

This document is a pre-registration candidate. Dollar thresholds below are pilot design choices to be challenged, frozen in a hashed manifest, and only then applied to real outcomes. They are not universal or final definitions of token quality.

## Question and estimand

Among permissionlessly observed Base token/pool launches in the fixed historical cohort, do features observable in the first six hours after T0 improve prediction of the locked 30-day success label on chronologically later launches versus a constant probability equal to training-set prevalence?

The unit is a token identified by `(chain, token contract)`, never symbol. When a token has multiple qualifying pools, T0 is the earliest qualifying event and observations are aggregated across audited qualifying pools. Pool-level sensitivity analysis remains separate.

## Initial universe and fixed period

v0 uses Base because it has enough historical DEX activity for pipeline development while a newer target chain may not yet have a mature 30-day history. The proposed cohort interval is `[2025-01-01T00:00:00Z, 2025-07-01T00:00:00Z)`. The period is historical and fixed; it is not selected after examining labels.

The universe starts from onchain factory/pool events where decoded, supplemented by Dune `dex.trades` to establish activity. It must not start from CoinGecko listings, DEX Screener profiles/boosts/search, social promotion, or a curated winner list. The supplied SQL is a conservative first-seen-in-trades template, not yet the complete universe: factory event unions are required to include zero-trade pool creations and to establish true pool-creation T0.

Proposed quote whitelist: canonical Base WETH and native USDC only, with exact contract addresses, proxy/bridge status, and decimals independently verified and frozen in the first locked manifest. No address is hard-coded in this draft because that verification has not yet occurred.

### Inclusion

- Base contract paired directly with a frozen quote asset in an audited DEX pool/factory surface.
- Qualifying pool creation or, in the limited trades-first-seen fallback, first qualifying trade falls inside the fixed interval.
- Token and quote contract identities are recoverable without relying on symbols.
- Data required to distinguish no activity from missing ingestion is available or explicitly marked partial.
- Multiple pools for the same chain+token are deduplicated into one token unit after retaining the pool map.

### Exclusion

- Quote assets themselves, quote/quote pools, non-contract native pseudo-addresses not mapped by the locked protocol, and known test/malformed records.
- Tokens deployed before the launch lookback allowed by the locked factory/deployment rule. The exact lookback is unresolved and must be frozen before collection.
- Pools whose project contract semantics cannot be audited (for example, an address that is actually a router rather than a pool) until resolved.
- Records with unrecoverable chain or contract identity. Missing market performance alone is not exclusion and should generally produce failure/missing-label handling defined below.

All exclusions receive a reason code and counts are published. There is no minimum volume, liquidity, trader count, listing status, or continued activity filter.

## Time definitions

- **T0:** preferred definition is the confirmed onchain pool-created event time from an audited factory. Fallback v0 definition is the first qualifying segment in Dune `dex.trades`, labeled `dex_trades_first_seen`; the two definitions must not be silently mixed.
- **Feature window:** closed interval `[T0, T0 + 6 hours]`. Six hours is short enough to represent early behavior and long enough to avoid a single-block microstructure study. Every observation is converted to seconds since T0; pre-T0 and post-cutoff events are excluded from features.
- **Outcome window:** `(T0 + 6 hours, T0 + 30 days]` for label evidence, while 30-day cumulative volume may be calculated from T0 only as an outcome. No outcome-derived field may enter the feature matrix.
- **Maturity:** a launch is labeled only after T0 + 30 days and after source-latency buffer specified in the locked manifest.

## Feature families (scalar v0)

The stdlib pipeline currently computes swap count, buy/sell/unknown counts, observed USD volume, buy-volume ratio, distinct observed traders, active-hour buckets, first/last observed liquidity, and liquidity change ratio inside six hours. These are descriptive onchain observations, not proof of organic demand. USD-valued fields inherit upstream price-coverage and outlier biases; raw quote amounts should be retained in the real extractor for sensitivity checks.

Before fitting any model, each feature definition, null treatment, address attribution rule, aggregator/multihop deduplication rule, and winsorization choice must be locked. v0 tests only scalars. Graph, text, social, and listing features are out of scope for the first confirmatory run.

## Draft 30-day success label

The proposed conjunctive label is `1` only if all three conditions hold:

1. cumulative qualifying DEX volume from T0 through day 30 is at least USD 1,000,000;
2. maximum audited pool liquidity during days 7 through 30 is at least USD 250,000; and
3. at least one qualifying trade occurs during days 23 through 30.

Otherwise the label is `0`, provided source completeness is established. Missing ingestion is `missing`, not automatically failure. A genuinely inactive launch with complete coverage is a failure and remains in the denominator. These thresholds are a **draft pilot definition**, not final. They must be reviewed for quote-price integrity and feasibility using only a design/pilot slice with labels firewalled from the confirmatory holdout, then frozen before confirmatory label generation. Alternative thresholds belong to explicitly labeled sensitivity analyses.

## Splits and evaluation

Sort by T0 and keep equal T0 timestamps together. Proposed split proportions are 60% train, 20% validation, 20% final chronological holdout. The holdout is later in time, opened once after feature/label logic is locked. No random reshuffling.

The mandatory baseline predicts a constant probability equal to training prevalence. Report prevalence, Brier score, log loss, accuracy at a predeclared 0.5 cutoff, label counts, confidence intervals, and missingness. Any pattern model must beat the same scalar/prevalence baseline on the later holdout; validation-only improvements are not a result. Calibration and decision utility matter more than headline accuracy under imbalance.

## Bias and integrity controls

- **Leakage:** event-time cutoffs are enforced in code and unit tests. Outcome tables are physically/logically separated. API current snapshots cannot backfill early features.
- **Survivorship:** begin from factory/pool/trade surfaces, retain inactive launches, publish zero-activity counts, and never require a current listing/page. The trades-first-seen query cannot see zero-trade launches, so it is explicitly incomplete until factory unions are added.
- **Wash trading/Sybil:** preserve transaction, taker, sender, pool, route, and block identifiers; flag self-routing, repeated counterparties, same-block loops, extreme concentration, and known sandwich/MEV patterns. Primary analysis reports raw and filtered sensitivity results. Heuristics are frozen before holdout.
- **Multihop duplication:** Dune `dex.trades` can record route segments. Deduplicate user intents only with an audited transaction/route rule; otherwise call counts “segments,” not trades.
- **Price bias:** retain raw token/quote amounts and source flags. Never equate missing USD value with zero. Recompute against the frozen quote where feasible.
- **Identity drift:** lowercase/checksum normalization is representation only; chain+contract remains identity. Symbols and names are metadata.
- **Coverage drift:** record Dune query ID/version, execution ID, extraction time, table docs snapshot date, cohort counts, exclusion counts, and SHA-256 hashes.
- **Enrichment bias:** CoinGecko and DEX Screener are optional enrichment. Discovery, ranking, current liquidity, boosts, and profile presence cannot determine inclusion or success.

## Missing data and failures

Every candidate receives one of: included-complete, included-partial, excluded-with-reason, or source-coverage-unknown. Full failures are not dropped for having zero later swaps, zero observed later liquidity, no listing, no profile, or an inactive pool. A launch is removed only by a preregistered exclusion rule. Report the complete flow from raw factory/pool candidates to labeled analysis rows.

## Locking, reproducibility, and publication

Before real labels are materialized:

1. audit factory and DEX coverage; verify the quote whitelist;
2. freeze SQL, schema, feature code, outcome logic, exclusions, and split policy;
3. generate a manifest with file hashes and `study_status=protocol_locked`;
4. extract features, wait for maturity where needed, then generate labels;
5. run validation and a single chronological holdout evaluation.

Publish cohort flow, data-quality diagnostics, baseline and model metrics, all preregistered sensitivity checks, and code/manifests. Publish a null result if patterns do not outperform the prevalence baseline. Do not relabel, narrow the cohort, or promote an exploratory subgroup after seeing holdout outcomes without calling it a new exploratory study.

**NO RESULT CLAIMED.**

