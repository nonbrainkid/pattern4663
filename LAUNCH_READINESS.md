# PATTERN launch readiness

**Website code: deploy-ready. Token launch: not ready.**

The current website and manifest intentionally describe a prelaunch project. Public launch must remain blocked until every item below is completed and independently checked.

| Field | Current | Blocker | Where to update |
| --- | --- | --- | --- |
| Project name | `PATTERN` | Final identity sign-off and periodic collision recheck required | `app/_data/project.ts`, `public/token.json`, public bios |
| Symbol | `P4663` | Collision review selected this chain-linked symbol; final sign-off and periodic recheck remain required | `app/_data/project.ts`, `public/token.json`, public bios |
| Network | Robinhood Chain (`4663`) | Confirm deploy wallet is on chain ID `4663` before signing | `app/_data/project.ts`, `public/token.json` |
| Launch status | `prelaunch` | Contract, links, venue, and public-access approval are incomplete | `app/_data/project.ts`, `public/token.json` |
| Contract address | `null` / not published | Deploy, verify source, and complete a four-eyes address check | `app/_data/project.ts`, `public/token.json` |
| Explorer URL | `null` | Verified contract page does not exist yet | `app/_data/project.ts`, `public/token.json` |
| X account | `null` | Reserve the handle, secure it, and prove project control | `app/_data/project.ts`, `public/token.json`, public bios |
| Canonical domain | `null` | Acquire domain, configure HTTPS, and verify control | `app/_data/project.ts`, `public/token.json`, hosting configuration |
| Launch venue | `null` | Venue and exact official URL are not confirmed | `app/_data/project.ts`, `public/token.json` |
| Public access | Private deployment | Explicit founder approval and final release review required | Hosting access controls |
| Social preview | Request-host absolute URL | Must be verified against the final HTTPS canonical host | `app/_data/project.ts`, deployed page metadata |
| Scam monitoring | Not established | Assign monitoring, reporting, and impersonation-response owners | Launch operations runbook |

## Go-live checklist

- [ ] Approve the documented name and ticker collision review for launch, record the decision, and schedule periodic rechecks; do not describe either identifier as globally unique.
- [ ] Reserve the official X handle, enable strong account security, and verify project control.
- [ ] Acquire and configure the custom canonical domain with HTTPS.
- [ ] Deploy the intended contract on Robinhood Chain ID `4663` from the approved wallet.
- [ ] Verify the contract source and constructor parameters on the explorer.
- [ ] Have two people compare the contract address character-for-character across the deployment receipt, explorer, website config, manifest, and launch announcement.
- [ ] Add the exact explorer URL and confirmed launch venue URL.
- [ ] Replace all draft bios with the final canonical domain, X handle, chain, ticker, and contract address.
- [ ] Wire the account and contract calls to action only after their URLs pass the four-eyes check.
- [ ] Set `canonicalUrl`, then verify canonical metadata and the Open Graph image use the final absolute HTTPS host.
- [ ] Update `public/token.json` in the same reviewed change as the website launch fields; do not publish contradictory records.
- [ ] Re-run lint, tests, and the production build from the release commit.
- [ ] Test the public URL, metadata, manifest, CTA destinations, mobile layout, and accessibility after release.
- [ ] Start scam and impersonation monitoring before announcement; publish one canonical verification path and reporting procedure.
- [ ] Obtain explicit approval to remove private access and make the site public.
- [ ] Announce only after the public site, explorer record, manifest, venue, and official account all agree.

Do not treat a deployed website, a reserved handle, or an explorer page alone as proof that the token is live. The canonical address must agree across every official surface before any public interaction is invited.
