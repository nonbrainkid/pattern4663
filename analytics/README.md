# PATTERN analytics contract

## Current state: disabled preparation only

The site contains a local, allowlisted event contract and a no-op provider. It
does not load a tracker, call an analytics endpoint, set cookies, or send
telemetry. `NEXT_PUBLIC_PATTERN_ANALYTICS_ENABLED` defaults to disabled. The
current adapter remains a no-op even if that flag is accidentally enabled.

The browser layer never records wallet addresses, the contract address, full
referrers, query strings, free text, market data, cookies, user IDs, device
identifiers, or fingerprinting inputs.

## Event allowlist

| Event | Allowed dimension | Meaning |
| --- | --- | --- |
| `page_view` | `route: / \| /verify` | An allowlisted public route rendered in the browser |
| `cta_outbound` | `destination: pons \| explorer \| x` | Click on an exact configured canonical outbound URL |
| `contract_copy` | none | Successful clipboard write from the canonical full-contract copy control |
| `lab_resolved` | none | First correct resolver completion in the current page instance |
| `field_note_action` | `action: copy \| share` | Successful clipboard copy or completed native share |

Unknown events, values, and additional fields are rejected rather than
forwarded. Outbound URLs are converted to a low-cardinality destination label;
the URL itself is never part of an event.

## Architecture

- `app/_lib/analytics.ts` owns validation, URL classification, listener
  lifecycle, and the provider interface.
- `app/_components/SiteAnalytics.tsx` captures the two allowlisted page paths,
  exact outbound destinations, and success-only local events.
- `ContractCopy` emits the bubbling `pattern:analytics` event with the exact
  detail `{ event: "contract_copy" }` only after the clipboard write resolves.
  Click attempts, failures, and manual fallback are not counted.
- `PatternLab` emits local browser events only after a resolver success or a
  successful field-note action.
- The default client is disabled and the default provider is a no-op. No
  dependency or external endpoint is present.

## Activation approval gate

Production telemetry remains blocked until the project owner explicitly
approves activation. A future change must complete all of these steps in one
reviewable release:

1. Record explicit approval for the provider, purpose, retention period, and
   public privacy disclosure.
2. Implement a provider adapter behind the existing interface; do not expand
   the event schema.
3. Add request-capture tests proving the outgoing body contains only the exact
   allowlisted event keys and values.
4. Verify the provider uses no cookies, persistent identifiers, fingerprinting,
   automatic page capture, session replay, or enriched referrer/query data.
5. Review the provider host and any required Content Security Policy change.
6. Add a documented kill switch and confirm disabling the public flag produces
   zero provider calls.
7. Only after those checks, set
   `NEXT_PUBLIC_PATTERN_ANALYTICS_ENABLED=true` in an approved production
   release and verify a single synthetic action end to end.

Setting the flag without implementing and approving an adapter does nothing.

## Reporting template

Use aggregate event counts only. Do not attempt to reconstruct people,
wallets, sessions, cohorts, or cross-site journeys.

### First 24 hours

| Metric | Count / ratio | Notes |
| --- | ---: | --- |
| Home page views |  | `page_view.route=/` |
| Verify page views |  | `page_view.route=/verify` |
| pons outbound clicks |  |  |
| Explorer outbound clicks |  |  |
| X outbound clicks |  |  |
| Contract copy actions |  |  |
| Lab resolutions |  |  |
| Field-note copies / shares |  | Report separately |
| Verify interest proxy |  | Verify views / home views |
| Launch CTA proxy |  | pons clicks / home views |

### First 48 hours

Repeat the 24-hour table for hours 25–48 and cumulative 0–48. Call out changes
in destination mix, verify interest, resolver completion, and field-note use.
Avoid causal language; traffic source is intentionally not collected.

### Day 7

Report daily aggregate counts, cumulative totals, and the median daily value for
each event. Compare days 1–2 with days 3–7 descriptively. Document site/content
changes that may have affected counts, but do not claim attribution.

### Sample-size caveat

These are event counts, not unique people or sessions. Reloads, repeat clicks,
multiple tabs, browser blocking, and native-share behavior can change totals.
Ratios are directional only, especially with small denominators. Suppress a
ratio when its denominator is below 30 events and show the raw counts instead.
