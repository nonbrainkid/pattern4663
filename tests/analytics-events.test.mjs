import assert from "node:assert/strict";
import test from "node:test";
import {
  PATTERN_ANALYTICS_EVENT,
  attachAnalyticsListeners,
  classifyOutboundDestination,
  createAnalyticsClient,
  dispatchPatternAnalytics,
  normalizeAnalyticsEvent,
  normalizeAnalyticsRoute,
} from "../app/_lib/analytics.ts";

const destinations = Object.freeze({
  pons: "https://venue.example/launchpad/pattern",
  explorer: "https://explorer.example/token/pattern",
  x: "https://x.com/Pattern4663",
});

class FakeListenerTarget {
  listeners = new Map();

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type, event) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  dispatchEvent(event) {
    this.dispatch(event.type, event);
    return true;
  }

  count(type) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

function clickTarget({ href = null } = {}) {
  const anchorNode = href
    ? { getAttribute: (name) => (name === "href" ? href : null) }
    : null;

  return {
    closest(selector) {
      if (selector === "a[href]") return anchorNode;
      return null;
    },
  };
}

test("accepts only the documented low-cardinality event contract", () => {
  const valid = [
    { event: "page_view", route: "/" },
    { event: "page_view", route: "/verify" },
    { event: "cta_outbound", destination: "pons" },
    { event: "cta_outbound", destination: "explorer" },
    { event: "cta_outbound", destination: "x" },
    { event: "contract_copy" },
    { event: "lab_resolved" },
    { event: "field_note_action", action: "copy" },
    { event: "field_note_action", action: "share" },
  ];

  for (const event of valid) {
    assert.deepEqual(normalizeAnalyticsEvent(event), event);
  }
});

test("rejects identifiers, free text, query strings, and unknown dimensions", () => {
  const rejected = [
    { event: "page_view", route: "/?wallet=0x123" },
    { event: "page_view", route: "/verify", referrer: "https://example.test" },
    { event: "cta_outbound", destination: "https://x.com/Pattern4663" },
    { event: "contract_copy", contractAddress: "0xB74E" },
    { event: "lab_resolved", userId: "observer-1" },
    { event: "field_note_action", action: "copy", note: "free text" },
    { event: "field_note_action", action: "cancel" },
  ];

  for (const event of rejected) {
    assert.equal(normalizeAnalyticsEvent(event), null);
  }
  assert.equal(normalizeAnalyticsRoute("/?utm_source=x"), null);
  assert.equal(normalizeAnalyticsRoute("/verify#contract"), null);
});

test("classifies only exact canonical outbound URLs", () => {
  assert.equal(
    classifyOutboundDestination(
      destinations.pons,
      destinations,
      "https://pattern4663.com",
    ),
    "pons",
  );
  assert.equal(
    classifyOutboundDestination(
      `${destinations.pons}?wallet=0x123`,
      destinations,
      "https://pattern4663.com",
    ),
    null,
  );
  assert.equal(
    classifyOutboundDestination(
      "https://lookalike.example/launchpad/pattern",
      destinations,
      "https://pattern4663.com",
    ),
    null,
  );
});

test("the default-disabled client makes zero provider calls", () => {
  const sent = [];
  const provider = { send: (event) => sent.push(event) };
  const disabled = createAnalyticsClient({ provider });

  assert.equal(disabled.emit({ event: "page_view", route: "/" }), false);
  assert.equal(sent.length, 0);

  const enabled = createAnalyticsClient({ enabled: true, provider });
  assert.equal(enabled.emit({ event: "page_view", route: "/private" }), false);
  assert.equal(sent.length, 0);
  assert.equal(enabled.emit({ event: "page_view", route: "/" }), true);
  assert.deepEqual(sent, [{ event: "page_view", route: "/" }]);
});

test("delegation emits one event per action and removes every listener", () => {
  const target = new FakeListenerTarget();
  const emitted = [];
  const cleanup = attachAnalyticsListeners(target, {
    emit: (event) => emitted.push(event),
    destinations,
    baseUrl: "https://pattern4663.com",
  });

  assert.equal(target.count("click"), 1);
  assert.equal(target.count(PATTERN_ANALYTICS_EVENT), 1);

  target.dispatch("click", {
    defaultPrevented: false,
    target: clickTarget({ href: destinations.explorer }),
  });
  assert.deepEqual(emitted, [
    { event: "cta_outbound", destination: "explorer" },
  ]);

  target.dispatch("click", {
    defaultPrevented: false,
    target: clickTarget(),
  });
  assert.equal(emitted.length, 1, "copy attempts must not be counted");

  assert.equal(
    dispatchPatternAnalytics({ event: "contract_copy" }, target),
    true,
  );
  assert.deepEqual(emitted.at(-1), { event: "contract_copy" });
  assert.equal(emitted.length, 2, "one success dispatch emits exactly once");

  assert.equal(
    dispatchPatternAnalytics(
      { event: "contract_copy", contractAddress: "0xB74E" },
      target,
    ),
    false,
  );
  assert.equal(emitted.length, 2, "sensitive detail must be rejected");

  assert.equal(
    dispatchPatternAnalytics(
      { event: "field_note_action", action: "share" },
      target,
    ),
    true,
  );
  assert.deepEqual(emitted.at(-1), {
    event: "field_note_action",
    action: "share",
  });
  assert.equal(emitted.length, 3);

  cleanup();
  assert.equal(target.count("click"), 0);
  assert.equal(target.count(PATTERN_ANALYTICS_EVENT), 0);

  target.dispatch("click", {
    defaultPrevented: false,
    target: clickTarget({ href: destinations.x }),
  });
  assert.equal(emitted.length, 3, "cleanup must prevent later emissions");
});
