# PATTERN INDEX research foundation

This directory is a runnable, dependency-free v0 foundation for a defensible token-launch study. It validates normalized JSONL/CSV records, enforces a six-hour feature cutoff, creates deterministic chronological splits, evaluates a prevalence-only baseline, and hashes study inputs. It does not contain a real launch dataset or a winner classifier.

**Status (2026-08-10): protocol draft; synthetic fixture only; credentials absent; real dataset not collected; NO RESULT CLAIMED.**

## Run it

From `research/pattern-index` with Python 3.10+:

```powershell
python pattern_index.py validate data/synthetic_demo.jsonl
python pattern_index.py features data/synthetic_demo.jsonl --output outputs/synthetic_features.json
python pattern_index.py baseline data/synthetic_demo.jsonl
python pattern_index.py run-demo
python -m unittest discover -s tests -v
```

Generate a deterministic input manifest (the timestamp is explicit by design):

```powershell
python pattern_index.py manifest --root . --file data/synthetic_demo.jsonl --file METHODOLOGY.md --generated-at 2026-08-10T00:00:00Z --output outputs/synthetic_manifest.json
```

Inspect credential presence without printing values:

```powershell
python pattern_index.py credential-status
```

CSV input uses the same scalar columns as the launch schema, with nested values encoded in `observations_json` and optional `outcome_30d_json`. `is_synthetic` must be `true` or `false`.

## Data-source matrix

| Source | Intended role | Universe source? | Credential variables | Current status and bias |
|---|---|---:|---|---|
| Dune `dex.trades` plus audited Base factory/raw surfaces | Cohort, event-time swaps, pool/factory evidence | Yes, after coverage audit | `DUNE_API_KEY` | Missing. Supplied SQL was not executed. `dex.trades` has route segments and cannot alone include zero-trade pools. |
| CoinGecko contract/onchain endpoints | Optional metadata and price sensitivity checks | No | `COINGECKO_API_KEY` or `COINGECKO_DEMO_API_KEY` | Missing. Listing/coverage selection and current-snapshot bias; never defines inclusion or label. |
| DEX Screener public token-pairs endpoint | Optional current pair metadata only | No | none for documented public endpoint; `DEXSCREENER_API_KEY` reserved for a separately contracted integration | Keyless adapter exists but is not called by demo. Current/discovery-biased, historically incomplete, and unable to represent zero-activity failures. |
| Synthetic JSONL fixture | Exercise validation, cutoffs, splits, baseline, manifests | Demo only | none | Available; invented identifiers and magnitudes; not market evidence. |

Credential values belong in environment variables or a secret manager, never source files, manifests, CLI arguments, logs, or chat. Example names only:

```powershell
$env:DUNE_API_KEY = '<configured outside source control>'
$env:COINGECKO_API_KEY = '<configured outside source control>'
# or: COINGECKO_DEMO_API_KEY
```

The code never logs credential values. The Dune stub only reads results from an already-saved query. No live API is called by tests or the synthetic demo.

## What must happen before real analysis

1. Review and lock `METHODOLOGY.md`, exact Base quote contracts, factory coverage, DEX/pool semantics, exclusion reasons, and the draft label.
2. Create an audited saved Dune query from `queries/dune_universe.sql`, record its query/version, then configure `DUNE_API_KEY`.
3. Add project-specific factory event unions so zero-trade launches enter the candidate flow; reconcile them with `dex.trades` and raw Base deployment/log data.
4. Export normalized immutable observations, validate them, freeze hashes in a `protocol_locked` manifest, and only then generate real 30-day labels.
5. Compare any scalar pattern model to training prevalence on chronologically later data and publish null results.

## Limitations

- The current SQL is a documented template and **has never been executed here**.
- First seen in `dex.trades` is not deployment time or guaranteed pool creation time. Dune states that a row is a route segment and `project_contract_address` is the contract emitting the event, which may need project-specific interpretation.
- The SQL has a 30-day pre-period lookback, not all-history proof that a token is new. The deployment/factory rule is intentionally unresolved until audited.
- `amount_usd`, upstream pricing, liquidity reconstruction, trader attribution, aggregator intent deduplication, MEV/wash filters, and source completeness all require real-data audits.
- The stdlib validator implements core invariants but is not a complete JSON Schema Draft 2020-12 engine.
- The demo baseline metrics are mechanically computed from invented labels and must never be shown as performance evidence.
- Public keyless enrichment is intentionally isolated and is not suitable for production historical cohort collection.

## Official references checked 2026-08-10

- Dune describes [`dex.trades`](https://docs.dune.com/data-catalog/curated/dex-trades/evm/dex-trades), including route-segment granularity, identity/address columns, and the emitting project contract.
- Dune's [DEX data overview](https://docs.dune.com/data-catalog/curated/dex-trades/overview) documents Base coverage, partition filters, source methodology, and API access.
- Dune documents Base [creation traces](https://docs.dune.com/data-catalog/evm/base/raw/creation-traces), [logs](https://docs.dune.com/data-catalog/evm/base/raw/logs), and [transactions](https://docs.dune.com/data-catalog/evm/base/raw/transactions) as raw onchain surfaces for the factory/deployment audit.
- Dune's [API getting started guide](https://docs.dune.com/api-reference/overview/getting-started) specifies `DUNE_API_KEY`, asynchronous execution, and result retrieval; the [latest query result endpoint](https://docs.dune.com/api-reference/executions/endpoint/get-query-result) documents read scope and pagination/result limits.
- CoinGecko documents [contract-address coin data](https://docs.coingecko.com/reference/coins-contract-address), [onchain token pricing](https://docs.coingecko.com/reference/onchain-simple-price), and its explicitly limited [keyless public API](https://docs.coingecko.com/docs/keyless-public-api).
- DEX Screener's official [API reference](https://docs.dexscreener.com/api/reference) documents public token-pair endpoints and per-endpoint rate limits.

**NO RESULT CLAIMED.**

