# PATTERN / $P4663

Live website and content-operations repository for PATTERN, an independent culture coin on Robinhood Chain mainnet.

## Canonical live identity

| Field | Canonical value |
| --- | --- |
| Brand | `PATTERN` |
| On-chain token name | `Pattern` |
| Symbol / public ticker | `P4663` / `$P4663` |
| Network | `Robinhood Chain mainnet` |
| Chain ID | `4663` |
| Contract address | `0xB74E8B647517813D8b3790240e98F2E9A09cf5a3` |
| Decimals | `18` |
| Total supply | `1,000,000,000 P4663` |
| Website | <https://pattern4663.com> |
| Official X | <https://x.com/Pattern4663> |
| Blockscout | <https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> |
| pons launch page | <https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> |

The contract address must always be copied in full. Never treat a ticker, token name, screenshot, direct message, shortened link, or reply as identity proof.

## Source-of-truth documents

- [`docs/LIVE_SOURCE_OF_TRUTH.md`](docs/LIVE_SOURCE_OF_TRUTH.md) — confirmed facts, perishable facts, unknowns, prohibited claims, and evidence timestamps.
- [`docs/CM_VERIFIED_BRIEF.md`](docs/CM_VERIFIED_BRIEF.md) — constrained handoff for the existing Claude community-manager queue. It does not create or retime any queue.
- [`docs/POST_LAUNCH_RUNBOOK.md`](docs/POST_LAUNCH_RUNBOOK.md) — recurring factual checks, scam intake, incident response, and safe content updates.
- [`LAUNCH_READINESS.md`](LAUNCH_READINESS.md) — current operational gaps after launch.
- [`TOKEN_LAUNCH_PLAYBOOK.md`](TOKEN_LAUNCH_PLAYBOOK.md) and [`SOCIAL_PLAYBOOK.md`](SOCIAL_PLAYBOOK.md) — live-state publishing controls and approved copy patterns.

When documents disagree, stop publication and reconcile them against Blockscout, the canonical website, the exact pons token page, and Robinhood Chain documentation. Volatile values such as price, market cap, volume, holder count, transfer count, and venue phase must never be copied from this repository as current facts.

## Local development

Prerequisite: Node.js `>=22.13.0`.

```powershell
npm install
npm run dev
```

Useful checks:

```powershell
npm run lint
npm test
npm run build:vercel
```

The application uses Next.js/React and supports the vinext build path. Production is deployed through Vercel from the reviewed Git branch. Do not modify deployment or publish content merely by editing documentation.

## Content and asset safety

- Do not bake the contract address into generic raster artwork. Keep it copyable in text and canonical web surfaces.
- Keep historical launch-state artwork for provenance, but never publish an asset carrying stale launch-state text. See [`public/brand/README.md`](public/brand/README.md) and [`public/brand/posts/README.md`](public/brand/posts/README.md).
- Do not claim Robinhood or pons endorsement, a listing, a graduation, a pool, an audit, safety, a return, or utility without current primary evidence and explicit approval.
- The Pattern Index is editorial and educational; it is not a trading signal.

## Standing disclosure

> PATTERN is an independent culture coin launched on Robinhood Chain via pons. It is not issued, sponsored, endorsed, or operated by Robinhood or pons. The token is experimental and volatile. Availability can depend on jurisdiction. No listing, financial return, or utility is promised. PATTERN ATLAS is editorial and educational content, not financial advice or a trading signal. Verify the full contract address on the canonical domain and Robinhood Chain explorer before interacting.
