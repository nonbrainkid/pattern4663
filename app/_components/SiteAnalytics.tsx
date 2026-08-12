"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { project } from "../_data/project";
import {
  attachAnalyticsListeners,
  createAnalyticsClient,
  normalizeAnalyticsRoute,
  type AnalyticsDestinations,
} from "../_lib/analytics";

const destinations: AnalyticsDestinations = Object.freeze({
  pons: project.launchUrl,
  explorer: project.explorerUrl,
  x: project.xUrl,
});

// This flag is an approval gate, not a provider. With the current no-op
// adapter, even an accidental true value cannot create a network request.
const analytics = createAnalyticsClient({
  enabled: process.env.NEXT_PUBLIC_PATTERN_ANALYTICS_ENABLED === "true",
});

export function SiteAnalytics() {
  const pathname = usePathname();
  const lastViewedRoute = useRef<string | null>(null);

  useEffect(() => {
    return attachAnalyticsListeners(document, {
      emit: analytics.emit,
      destinations,
      baseUrl: window.location.origin,
    });
  }, []);

  useEffect(() => {
    const route = normalizeAnalyticsRoute(pathname);
    if (!route || lastViewedRoute.current === route) return;

    lastViewedRoute.current = route;
    analytics.emit({ event: "page_view", route });
  }, [pathname]);

  return null;
}
