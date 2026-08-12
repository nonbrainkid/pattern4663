export const PATTERN_ANALYTICS_EVENT = "pattern:analytics";

export const ANALYTICS_ROUTES = ["/", "/verify"] as const;
export const ANALYTICS_DESTINATIONS = ["pons", "explorer", "x"] as const;
export const FIELD_NOTE_ACTIONS = ["copy", "share"] as const;

export type AnalyticsRoute = (typeof ANALYTICS_ROUTES)[number];
export type AnalyticsDestination = (typeof ANALYTICS_DESTINATIONS)[number];
export type FieldNoteAction = (typeof FIELD_NOTE_ACTIONS)[number];

export type PatternAnalyticsEvent =
  | Readonly<{ event: "page_view"; route: AnalyticsRoute }>
  | Readonly<{
      event: "cta_outbound";
      destination: AnalyticsDestination;
    }>
  | Readonly<{ event: "contract_copy" }>
  | Readonly<{ event: "lab_resolved" }>
  | Readonly<{ event: "field_note_action"; action: FieldNoteAction }>;

export type AnalyticsProvider = Readonly<{
  send(event: PatternAnalyticsEvent): void | Promise<void>;
}>;

export type AnalyticsClient = Readonly<{
  emit(input: unknown): boolean;
}>;

export type AnalyticsDestinations = Readonly<
  Record<AnalyticsDestination, string>
>;

type AttributeNode = Readonly<{
  getAttribute(name: string): string | null;
}>;

type ClosestNode = Readonly<{
  closest(selector: string): AttributeNode | null;
}>;

type ListenerTarget = Readonly<{
  addEventListener(
    type: string,
    listener: (event: Event) => void,
  ): void;
  removeEventListener(
    type: string,
    listener: (event: Event) => void,
  ): void;
}>;

type DispatchTarget = Readonly<{
  dispatchEvent(event: Event): boolean;
}>;

const NOOP_PROVIDER: AnalyticsProvider = Object.freeze({
  send() {},
});

const ROUTES = new Set<string>(ANALYTICS_ROUTES);
const DESTINATIONS = new Set<string>(ANALYTICS_DESTINATIONS);
const NOTE_ACTIONS = new Set<string>(FIELD_NOTE_ACTIONS);

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function hasExactKeys(
  input: Record<string, unknown>,
  expected: readonly string[],
) {
  const actual = Object.keys(input);
  return (
    actual.length === expected.length &&
    expected.every((key) => Object.hasOwn(input, key))
  );
}

/**
 * Rejects unknown fields instead of forwarding or trimming them. This keeps
 * contract addresses, query strings, referrers, free text, and identifiers out
 * of the event boundary by construction.
 */
export function normalizeAnalyticsEvent(
  input: unknown,
): PatternAnalyticsEvent | null {
  if (!isRecord(input) || typeof input.event !== "string") return null;

  switch (input.event) {
    case "page_view":
      if (
        !hasExactKeys(input, ["event", "route"]) ||
        typeof input.route !== "string" ||
        !ROUTES.has(input.route)
      ) {
        return null;
      }
      return Object.freeze({
        event: "page_view",
        route: input.route as AnalyticsRoute,
      });

    case "cta_outbound":
      if (
        !hasExactKeys(input, ["event", "destination"]) ||
        typeof input.destination !== "string" ||
        !DESTINATIONS.has(input.destination)
      ) {
        return null;
      }
      return Object.freeze({
        event: "cta_outbound",
        destination: input.destination as AnalyticsDestination,
      });

    case "contract_copy":
      return hasExactKeys(input, ["event"])
        ? Object.freeze({ event: "contract_copy" })
        : null;

    case "lab_resolved":
      return hasExactKeys(input, ["event"])
        ? Object.freeze({ event: "lab_resolved" })
        : null;

    case "field_note_action":
      if (
        !hasExactKeys(input, ["event", "action"]) ||
        typeof input.action !== "string" ||
        !NOTE_ACTIONS.has(input.action)
      ) {
        return null;
      }
      return Object.freeze({
        event: "field_note_action",
        action: input.action as FieldNoteAction,
      });

    default:
      return null;
  }
}

export function createAnalyticsClient({
  enabled = false,
  provider = NOOP_PROVIDER,
}: Readonly<{
  enabled?: boolean;
  provider?: AnalyticsProvider;
}> = {}): AnalyticsClient {
  return Object.freeze({
    emit(input: unknown) {
      const event = normalizeAnalyticsEvent(input);
      if (!enabled || !event) return false;

      try {
        const result = provider.send(event);
        if (result instanceof Promise) void result.catch(() => undefined);
        return true;
      } catch {
        return false;
      }
    },
  });
}

export function normalizeAnalyticsRoute(pathname: string): AnalyticsRoute | null {
  return ROUTES.has(pathname) ? (pathname as AnalyticsRoute) : null;
}

export function classifyOutboundDestination(
  rawHref: string,
  destinations: AnalyticsDestinations,
  baseUrl: string,
): AnalyticsDestination | null {
  try {
    const candidate = new URL(rawHref, baseUrl).href;
    for (const destination of ANALYTICS_DESTINATIONS) {
      if (candidate === new URL(destinations[destination]).href) {
        return destination;
      }
    }
  } catch {
    // Invalid or non-URL values are intentionally ignored.
  }

  return null;
}

function closestNode(target: EventTarget | null, selector: string) {
  if (!target) return null;

  const candidate = target as unknown as Partial<ClosestNode>;
  if (typeof candidate.closest !== "function") return null;
  return candidate.closest(selector);
}

export function attachAnalyticsListeners(
  target: ListenerTarget,
  {
    emit,
    destinations,
    baseUrl,
  }: Readonly<{
    emit(event: PatternAnalyticsEvent): boolean | void;
    destinations: AnalyticsDestinations;
    baseUrl: string;
  }>,
) {
  const onClick = (event: Event) => {
    if (event.defaultPrevented) return;

    const anchor = closestNode(event.target, "a[href]");
    const href = anchor?.getAttribute("href");
    if (!href) return;

    const destination = classifyOutboundDestination(
      href,
      destinations,
      baseUrl,
    );
    if (destination) emit({ event: "cta_outbound", destination });
  };

  const onPatternEvent = (event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail;
    const normalized = normalizeAnalyticsEvent(detail);
    if (normalized) emit(normalized);
  };

  target.addEventListener("click", onClick);
  target.addEventListener(PATTERN_ANALYTICS_EVENT, onPatternEvent);

  return () => {
    target.removeEventListener("click", onClick);
    target.removeEventListener(PATTERN_ANALYTICS_EVENT, onPatternEvent);
  };
}

export function dispatchPatternAnalytics(
  input: unknown,
  target: DispatchTarget | null =
    typeof document === "undefined" ? null : document,
) {
  const event = normalizeAnalyticsEvent(input);
  if (!target || !event || typeof CustomEvent === "undefined") return false;

  target.dispatchEvent(
    new CustomEvent(PATTERN_ANALYTICS_EVENT, {
      detail: event,
    }),
  );
  return true;
}
