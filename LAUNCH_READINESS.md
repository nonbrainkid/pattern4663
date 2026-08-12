# PATTERN post-launch readiness

**Current state: token live; operational controls still require continuous verification.**

Snapshot checked: **2026-08-12 10:59 +06:00 (04:59 UTC)**. Live identity is sourced from [`docs/LIVE_SOURCE_OF_TRUTH.md`](docs/LIVE_SOURCE_OF_TRUTH.md). Perishable values must be checked again at the moment of use.

## Canonical live record

| Field | Current verified value | Operational rule |
| --- | --- | --- |
| Brand / symbol | `PATTERN` / `P4663` (`$P4663` in public copy) | Do not identify the token by ticker alone. |
| Network | Robinhood Chain mainnet, chain ID `4663` | Confirm `4663` before any wallet interaction. |
| Contract address | `0xB74E8B647517813D8b3790240e98F2E9A09cf5a3` | Compare all 42 characters; never shorten during verification. |
| Decimals / total supply | `18` / `1,000,000,000 P4663` | Source from Blockscout/API, not social posts. |
| Website | <https://pattern4663.com> | Canonical project domain; reject mirrors and shorteners. |
| Official X | <https://x.com/Pattern4663> | Account URL is canonical, but account control and recovery still need operator checks. |
| Explorer | <https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> | Explorer verification is not an audit or safety guarantee. |
| Launch venue | <https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> | At the snapshot, pons reported `phase: 0`, `venue: curve`, and no pool. This is perishable. |
| Community queue | One existing Claude CM hourly queue | Do not create a second queue or change its schedule from repository documentation. |

## Completed launch-state checks

- [x] The token exists on Robinhood Chain mainnet and Blockscout returns the exact address as an ERC-20 contract.
- [x] Blockscout returns token name `Pattern`, symbol `P4663`, decimals `18`, and raw supply `1000000000000000000000000000`.
- [x] The raw supply resolves to `1,000,000,000 P4663` after applying 18 decimals.
- [x] The canonical website, Blockscout token page, exact pons token page, and X profile URL returned HTTP `200` at the snapshot time.
- [x] The canonical website repeats the exact contract, explorer URL, pons URL, and official X account.
- [x] Blockscout's address API reported `is_contract: true` and `is_verified: true` at the snapshot time.
- [x] Live identity and post-launch operating documents use the same checksum-form contract address and canonical URLs.

## Open operational controls

- [ ] Record who controls domain/DNS, Vercel, X account recovery, the deployer wallet, and content approval. Do not put secrets in this repository.
- [ ] Confirm strong authentication and recovery access for the official X account; record only completion and owner, never recovery codes.
- [ ] Assign a named scam-monitoring owner and backup.
- [ ] Approve a public scam-reporting channel already controlled by the project. No reporting email is currently documented; do not invent one.
- [ ] Maintain a timestamped daily cross-surface check log following [`docs/POST_LAUNCH_RUNBOOK.md`](docs/POST_LAUNCH_RUNBOOK.md).
- [ ] Check whether the pinned X content exposes the exact CA, website, Blockscout, pons URL, and independence disclosure without stale launch-state language.
- [ ] Confirm mobile and desktop link behavior after every production release.
- [ ] Define a two-person approval path for any claim about pons graduation, pool creation, audit status, listing, partnership, utility, or financial performance.
- [ ] Keep an incident log and test the correction/queue-pause procedure.

## Release gate for site or content changes

Before publishing a site release or factual social post:

1. Copy the contract address from Blockscout and compare it with the website, pons token page, and the draft.
2. Recheck chain ID `4663` against Robinhood Chain documentation.
3. Open every canonical URL in a clean session and record timestamp plus HTTP result.
4. If mentioning venue state, query pons immediately before publication and state the observation time. Do not infer graduation or a pool.
5. Remove price, market cap, volume, holder, and transfer values from evergreen copy.
6. Confirm the independence disclosure and absence of return, listing, utility, audit, or endorsement claims.
7. Run `npm run lint`, `npm test`, and `npm run build:vercel` for code changes.
8. Pause publication if any canonical surface disagrees.

## Historical material rule

> **HISTORICAL / DO NOT PUBLISH:** Any launch-state copy or artwork that says `PRE-LAUNCH`, `NO CONTRACT PUBLISHED`, or otherwise describes an earlier state is retained only for provenance and campaign history. It cannot be used as current creative, quoted as current fact, or placed into the active CM queue.

A deployed website, an X handle, or a venue page alone is not sufficient identity proof. All canonical surfaces must agree on the exact checksum-form address before interaction is invited.
