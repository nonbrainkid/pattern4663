# PATTERN post-launch runbook

Operational procedure for keeping the PATTERN / `$P4663` website, social content, venue references, and public verification path accurate after launch.

**Baseline snapshot:** 2026-08-12 10:59 +06:00 (04:59 UTC)

**Canonical fact sheet:** [`LIVE_SOURCE_OF_TRUTH.md`](LIVE_SOURCE_OF_TRUTH.md)

**Community-manager handoff:** [`CM_VERIFIED_BRIEF.md`](CM_VERIFIED_BRIEF.md)

## 1. Canonical baseline

| Field | Exact value |
| --- | --- |
| Token | `PATTERN / $P4663` |
| Network | Robinhood Chain mainnet, chain ID `4663` |
| Contract address | `0xB74E8B647517813D8b3790240e98F2E9A09cf5a3` |
| Website | <https://pattern4663.com> |
| X | <https://x.com/Pattern4663> |
| Blockscout | <https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> |
| pons | <https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3> |
| Decimals / total supply | `18` / `1,000,000,000 P4663` |

Never use a shortened address for verification. Never use a DM, reply, screenshot, search result, ticker, or token name as the only identity source.

## 2. Roles and access

Assign actual people outside this document; do not store secrets here.

| Role | Responsibility |
| --- | --- |
| Project owner | Final authority for public corrections, incident severity, and new claims |
| CM operator | Existing hourly queue, replies, scam evidence capture, and post-publication checks |
| Web maintainer | Canonical site, manifest/config consistency, deployment, and rollback |
| Domain operator | DNS, registrar, HTTPS, and recovery controls |
| X account operator | Strong authentication, recovery, session review, and pinned verification content |
| Wallet/deployment controller | On-chain receipts and wallet security; never shares secrets with content operators |
| Second checker | Independent CA/link comparison and approval for high-risk state changes |

No reporting email is currently documented. Do not invent one. Accept scam reports only through project-controlled channels that the project owner has explicitly published; record how each report arrived.

## 3. Refresh cadence

| Cadence | Checks | Record |
| --- | --- | --- |
| Before every factual social post | Full CA, site, cited link, chain, disclosure, and any perishable fact | URL, timestamp/timezone, operator |
| Before every pons phase/graduation/pool claim | Exact pons page raw/UI state, Blockscout/on-chain evidence, second checker | Raw fields, screenshot, explorer evidence, two approvals |
| After every site deployment | Homepage, CA copy behavior, Blockscout/pons/X links, metadata, mobile/desktop, HTTPS/redirects | Release SHA, production URL, check results |
| Daily | Website, X profile/pinned identity, Blockscout token page/API, pons identity, cross-surface CA equality | Daily verification log |
| Twice daily during active launch attention or a scam wave | X impersonators, malicious replies, lookalike domains, conflicting CAs | Incident-log entries and platform actions |
| Weekly | Domain/X recovery readiness, access owners, pinned post, disclosure, runbook ownership | Completion only; never recovery secrets |
| Monthly or after a material change | All canonical docs, brand assets, queue brief, collision/impersonation landscape | Reviewed file list and approved changes |

The existing Claude CM queue remains the only queue. This runbook does not create, duplicate, or retime it.

## 4. Daily cross-surface check

1. Open `https://pattern4663.com` in a clean browser session.
2. Confirm HTTPS, expected domain, and no unexpected redirect.
3. Copy the full CA from the website.
4. Open the exact Blockscout token page and compare all 42 characters.
5. Confirm Blockscout still reports `Pattern`, `P4663`, decimals `18`, and the expected total supply.
6. Open the exact pons URL and compare its token address, name, symbol, decimals, and total supply.
7. Open `https://x.com/Pattern4663`; inspect profile links and pinned verification content for stale or contradictory facts.
8. Confirm all links are unshortened and point to the exact canonical URLs.
9. Record results with local time, UTC time, operator, and any discrepancy.
10. If any CA or canonical URL disagrees, stop factual publishing and open an incident.

Optional read-only endpoint checks:

```powershell
Invoke-RestMethod 'https://robinhoodchain.blockscout.com/api/v2/tokens/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3'
Invoke-RestMethod 'https://robinhoodchain.blockscout.com/api/v2/addresses/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3'
```

Explorer API availability and `is_verified` are perishable. Explorer verification is not an audit or safety guarantee.

## 5. pons graduation or pool change

Baseline at **2026-08-12 10:59 +06:00**:

```text
phase: 0
venue: curve
poolKey: null
poolId: null
```

This baseline is not a current claim after the timestamp.

Before announcing graduation, pool availability, DEX availability, or a venue-state transition:

1. Open the exact pons token URL in a fresh session.
2. Capture the current visible state and the raw fields for `phase`, `venue`, `poolKey`, and `poolId`.
3. Record exact time with timezone and the unshortened URL.
4. Verify the related on-chain transaction/contract or pool reference on Blockscout. Do not infer a pool solely from generic trade UI.
5. Have a second operator independently repeat the checks.
6. Resolve any disagreement before drafting.
7. Draft literal wording that says what the sources show, without implying guaranteed liquidity, exchange support, endorsement, safety, or returns.
8. Update [`LIVE_SOURCE_OF_TRUTH.md`](LIVE_SOURCE_OF_TRUTH.md), the website configuration, relevant playbooks, and the CM brief in one reviewed change if the state is durable enough to document.
9. Publish through the existing queue only if the project owner approves the timing; do not create a second queue.
10. Re-open the live post and all links after publication.

If pons and Blockscout do not support the same conclusion, state `Not verified` and escalate. Do not announce the transition.

## 6. Perishable market data

Price, market cap, volume, holders, transfers, liquidity, percentage change, curve progress, and venue phase are excluded from evergreen repository docs.

If an operator explicitly approves a point-in-time metric:

- source it immediately before publication;
- use the primary URL;
- record value, units, timestamp, timezone, and operator;
- say `As observed at [timestamp]` in public copy when context requires;
- avoid trend, causation, forecast, or return language;
- do not schedule it for a later slot without refreshing it;
- do not turn a screenshot into the canonical record.

Default action: omit the metric.

## 7. Scam report intake

Do not visit a suspicious URL with a connected wallet. Use an isolated browser/session for visual evidence if needed.

Record:

```text
Incident ID:
Received at (local + UTC):
Received through approved channel:
Reporter identifier (minimum necessary):
Platform:
Impersonating handle/domain:
Full suspicious URL (do not hyperlink in public docs):
Claimed contract address:
Screenshot/evidence location:
First seen / last seen:
Audience exposure estimate and source:
Canonical-surface comparison:
Platform/registrar report ID:
Actions taken:
Current owner:
Next review time:
```

Privacy and safety:

- collect only information needed to investigate;
- do not request seed phrases, private keys, recovery codes, signatures, transaction authorization, or wallet connection;
- do not publish a reporter's personal information;
- do not invent a support email, form, or Telegram account;
- do not paste a malicious address without clearly labeling it noncanonical and keeping the canonical CA adjacent.

## 8. Incident severity and escalation

### SEV-0 — canonical control or CA integrity at risk

Examples: compromised X/domain/Vercel access, canonical site serving a different CA, unauthorized deployment, or project account publishing a different CA.

1. Pause factual and promotional posts in the existing queue. Do not delete the queue or create a replacement.
2. Preserve screenshots, headers/raw responses, URLs, timestamps, commit/deployment identifiers, and account-session evidence.
3. Notify the project owner, affected surface operator, web maintainer, and wallet/deployment controller immediately.
4. Do not transact or rotate keys through a link supplied by the incident source.
5. Restore the last verified canonical state through the responsible platform's approved recovery path.
6. Publish a clear safety notice from any still-controlled canonical surface; do not include an unverified replacement CA.
7. Resume only after two people confirm every canonical surface.

### SEV-1 — high-reach impersonation or conflicting public content

Examples: a lookalike account/domain gaining attention, a high-reach post with wrong CA, or widespread malicious replies.

1. Pause affected queued factual/promotional posts.
2. Capture evidence and report the impersonator to the platform/registrar.
3. Publish or pin the canonical verification path from the controlled account.
4. Hide/report malicious replies where platform controls allow.
5. Monitor until reach and replies stabilize; record every action.

### SEV-2 — isolated scam or documentation error

Examples: one fake reply, an old link, or a stale internal document that has not reached the public.

1. Capture and report.
2. Correct the source document/content.
3. Check for duplicates across the repository and queue.
4. Escalate if reach grows or canonical surfaces become involved.

If no named incident owner is recorded, the project owner is the escalation destination. Assign real owners as an open readiness item; do not invent names in this runbook.

## 9. Public safety and correction copy

While investigating:

> We have not verified that account, link, or contract. Do not connect, sign, or transact while it is being checked. Verify PATTERN through https://pattern4663.com and the exact Robinhood Chain Blockscout page.

Confirmed mismatch:

> Security warning: that account, link, or contract is not canonical. Do not interact. PATTERN / $P4663 is on chain 4663. Canonical CA: `0xB74E8B647517813D8b3790240e98F2E9A09cf5a3`. Verify it at https://pattern4663.com and https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3.

Correction template:

> Correction: an earlier PATTERN post contained an incorrect [field]. The canonical value is [verified value], confirmed at [timestamp/timezone] on [primary sources]. The earlier value should not be used. Full verification path: https://pattern4663.com.

Replace bracketed fields, have a second operator review, and preserve the incorrect post/evidence internally. Do not silently edit the only public correction record when clarity requires a correction post.

## 10. Safe content and asset updates

1. Start from the live source of truth; do not copy identifiers from old captions or art.
2. Search the draft and selected asset for stale launch-state words, placeholders, shortened addresses, and obsolete links.
3. Keep the exact CA in accessible, selectable text. Do not place it only inside a raster.
4. Never overwrite a provenance master. Create a new versioned filename for changed pixels or text.
5. Preserve source filename, dimensions, color profile, renderer, source hash, and transformation notes.
6. Keep `SYNTHETIC / NOT MARKET DATA` and `RESULT / NOT CLAIMED` on Pattern Index material unless a separately reviewed evidence package justifies a new asset.
7. Check desktop/mobile crops, legibility, alt text, link destination, and disclosure.
8. Run the relevant renderer/QA command and `git diff --check`.
9. Have a second operator compare the full CA and URLs in any launch/safety asset package.
10. Update documentation and CM brief in the same reviewed change when canonical facts change.

Historical source assets under `public/brand/posts/` and the stale teaser are **HISTORICAL / DO NOT PUBLISH**. Keep them intact for provenance.

## 11. Website release verification

For a code or content release:

```powershell
npm run lint
npm test
npm run build:vercel
git diff --check
```

After deployment:

- open `https://pattern4663.com` from a clean session;
- confirm the release identifier/deployment is the intended commit;
- test CA copy, Blockscout, pons, X, metadata, and mobile/desktop layout;
- verify no stale state text or placeholder appears;
- compare the live HTML/token manifest with `LIVE_SOURCE_OF_TRUTH.md`;
- record the production check before announcing the release.

## 12. Verification log template

```text
Check ID:
Local time:
UTC time:
Operator:
Website status and CA:
X profile/pinned status:
Blockscout token/API status:
pons token identity:
pons phase/venue/pool fields (if needed):
Chain docs check (if needed):
Differences found:
Evidence locations:
Actions taken:
Second checker (if required):
Next check due:
```

Do not record secrets, session tokens, private keys, seed phrases, recovery codes, or personal data unrelated to the check.
