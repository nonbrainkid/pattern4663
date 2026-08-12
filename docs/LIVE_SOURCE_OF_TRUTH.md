# PATTERN live source of truth

This document is the canonical operational fact sheet for PATTERN / `$P4663`. It distinguishes stable identity, point-in-time observations, and claims that must not be made.

**Evidence snapshot:** 2026-08-12 10:59 +06:00 (2026-08-12 04:59 UTC)

**Scope:** public website, official X URL, Robinhood Chain documentation, Blockscout token/address APIs, and the exact pons launch page.

**Refresh rule:** stable on-chain identity may be reused after a source check; market and venue-state facts must be refreshed at publication time.

## Canonical strings

Copy these strings exactly. Do not retype or abbreviate the contract during verification.

| Field | Canonical value | Authority |
| --- | --- | --- |
| Brand | `PATTERN` | Project identity |
| On-chain token name | `Pattern` | Blockscout token API |
| On-chain symbol | `P4663` | Blockscout token API |
| Public ticker style | `$P4663` | Project identity |
| Token type | `ERC-20` | Blockscout token API |
| Network | `Robinhood Chain mainnet` | Robinhood Chain documentation |
| Chain ID | `4663` | Robinhood Chain documentation |
| Native gas token | `ETH` | Robinhood Chain documentation |
| Contract address | `0xB74E8B647517813D8b3790240e98F2E9A09cf5a3` | Blockscout and pons |
| Decimals | `18` | Blockscout token API |
| Raw total supply | `1000000000000000000000000000` | Blockscout token API |
| Display total supply | `1,000,000,000 P4663` | Raw supply divided by `10^18` |
| Website | <https://pattern4663.com> | Canonical project domain |
| Official X URL | <https://x.com/Pattern4663> | Founder-designated project account |
| Blockscout token page | <https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> | Robinhood Chain explorer |
| pons launch page | <https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> | Exact venue page |

## Confirmed at the evidence snapshot

1. Robinhood's official chain documentation identifies mainnet as chain ID `4663`, with ETH as the native currency and `robinhoodchain.blockscout.com` as the explorer.
2. Blockscout's token API returned address `0xB74E8B647517813D8b3790240e98F2E9A09cf5a3`, name `Pattern`, symbol `P4663`, type `ERC-20`, decimals `18`, and raw total supply `1000000000000000000000000000`.
3. Blockscout's address API returned the exact address with `is_contract: true` and `is_verified: true`.
4. Explorer verification means Blockscout recognized and verified contract source metadata. It does **not** mean the token was audited, endorsed, made safe, or guaranteed.
5. The canonical website returned HTTP `200` and repeated the exact CA, Blockscout URL, pons URL, and `@Pattern4663` account.
6. The exact pons launch page returned HTTP `200`, identified `Pattern` / `P4663`, the same contract, 18 decimals, and the same raw total supply.
7. The official X URL returned HTTP `200`. URL availability does not prove current account control, recovery readiness, or authenticity of every post.

## Perishable facts — fresh check required

These values must not be treated as repository constants:

| Fact | Snapshot observation | Publication rule |
| --- | --- | --- |
| pons phase | `phase: 0` | Re-open the exact token page immediately before mentioning phase. |
| pons venue | `venue: curve` / UI `Bonding curve` | Do not imply this state is permanent. |
| pons pool fields | `poolKey: null`, `poolId: null` | Do not claim graduation or pool availability from this snapshot. |
| Website availability/content | HTTP `200` and matching identity at snapshot | Recheck after every deployment and before a launch/safety post. |
| X availability/control | URL returned HTTP `200` | Operator must confirm signed-in control and recovery separately. |
| Explorer indexing/source status | Address and token data available at snapshot | Recheck before claiming explorer verification. Never call it an audit. |
| Price, market cap, volume, curve progress, liquidity, percentage change | Intentionally not recorded | Default to omission. If required, source and timestamp at publication time. |
| Holder count and transfer count | Intentionally not recorded | Default to omission; these change continuously. |

Required internal timestamp format for a perishable observation:

```text
Observed: YYYY-MM-DD HH:mm:ss ±HH:MM (UTC equivalent)
Source: full unshortened URL
Value/state: exact displayed or raw field
Checked by: operator name or approved identifier
Second check: required for graduation, pool, listing, partnership, audit, or incident claims
```

Do not schedule a perishable value long before publication. A timestamp does not make a value predictive or promotional.

## Unknown or not established

The evidence snapshot does not establish any of the following:

- a Robinhood or pons partnership, sponsorship, approval, operation, or endorsement;
- a Robinhood, centralized-exchange, or third-party listing;
- pons graduation, pool creation, DEX availability, or guaranteed liquidity;
- an independent security audit, legal review, risk rating, or safety guarantee;
- guaranteed price behavior, return, demand, market cap, holder growth, or trading outcome;
- utility, governance, rewards, yield, revenue share, buyback, access rights, or roadmap commitments;
- ownership/control of every lookalike domain or social account;
- the current state of account recovery, domain recovery, or operational key custody;
- a completed real-data Pattern Index study showing a winning token pattern.

When asked about an unknown, answer `Not verified` or `Not announced`. Do not convert an absence of evidence into a tease.

## Prohibited claims

Do not publish:

- `official Robinhood token`, `Robinhood-backed`, `Robinhood-approved`, `partnered with Robinhood`, `official pons token`, or equivalent language;
- `audited`, `safe`, `risk-free`, `rug-proof`, `guaranteed`, or `cannot fail` based on explorer verification;
- `graduated`, `pool live`, `DEX live`, `listed`, or `liquidity secured` without fresh primary evidence and two-person approval;
- price targets, `100x`, `moon`, passive-income language, return promises, or financial urgency;
- static price, market cap, volume, holders, transfers, liquidity, or curve-progress values copied from this repository;
- utility, reward, governance, access, yield, revenue-share, or buyback claims without a shipped public mechanism and risk disclosure;
- claims that mathematics, PATTERN ATLAS, or Pattern Index predicts token performance.

## Canonical verification path

For any public identity statement, compare all of the following:

1. `https://pattern4663.com`
2. `https://x.com/Pattern4663`
3. `https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3`
4. `https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3`
5. Robinhood Chain mainnet chain ID `4663` from <https://docs.robinhood.com/chain/connecting/>

Every contract string must match `0xB74E8B647517813D8b3790240e98F2E9A09cf5a3` character-for-character. A screenshot, cropped address, search result, DM, reply, ticker, or token name does not satisfy this check.

## Evidence endpoints and HTTP results

Checked read-only at the evidence snapshot:

| Source | Result | Evidence used |
| --- | --- | --- |
| <https://pattern4663.com> | HTTP `200` | Exact identity and canonical links present in rendered HTML |
| <https://x.com/Pattern4663> | HTTP `200` | Canonical profile URL reachable; control not inferred |
| <https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> | HTTP `200` | Exact token page reachable |
| <https://robinhoodchain.blockscout.com/api/v2/tokens/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> | HTTP `200` | Token name, symbol, type, decimals, raw supply, exact address |
| <https://robinhoodchain.blockscout.com/api/v2/addresses/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> | HTTP `200` | `is_contract` and explorer `is_verified` flags |
| <https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> | HTTP `200` | Exact token identity and point-in-time phase/venue/pool fields |
| <https://docs.robinhood.com/chain/connecting/> | HTTP `200` | Chain ID, gas token, explorer, and public RPC context |

## Conflict procedure

If any canonical surface disagrees:

1. pause factual publishing in the existing CM queue; do not create a replacement queue;
2. preserve screenshots, raw responses, URLs, and timestamps;
3. compare Blockscout/token data with the canonical website and pons record;
4. escalate to the project owner plus the operator responsible for the disagreeing surface;
5. correct the canonical website/source record first;
6. publish a clear correction from the controlled account if incorrect public content exists;
7. resume only after two people confirm the exact CA and links.

## Standing disclosure

> PATTERN is an independent culture coin launched on Robinhood Chain via pons. It is not issued, sponsored, endorsed, or operated by Robinhood or pons. The token is experimental and volatile. Availability can depend on jurisdiction. No listing, financial return, or utility is promised. PATTERN ATLAS is editorial and educational content, not financial advice or a trading signal. Verify the full contract address on the canonical domain and Robinhood Chain explorer before interacting.
