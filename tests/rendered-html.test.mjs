import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render({
  url = "http://localhost/",
  headers = {},
} = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(url, {
      headers: { accept: "text/html", ...headers },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the production PATTERN landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>PATTERN (?:\u2014|&#x2014;|&mdash;) See the Pattern<\/title>/i);
  assert.match(html, /SEE THE[\s\S]*PATTERN\./);
  assert.match(html, /Everything is noise until you see the pattern\./);
  assert.match(html, /PRE-LAUNCH \/ CONTRACT NOT PUBLISHED/);
  assert.match(html, /ROBINHOOD CHAIN/);
  assert.match(html, /Not affiliated with or endorsed by Robinhood Markets, Inc\./);
  assert.match(html, /No promise of profit, utility, or listing\./);
  assert.match(html, /SEE STRUCTURE\. VERIFY EVERYTHING\./);
  assert.match(html, /pattern_og_1200x630_v01\.png/);
  assert.match(html, /FIELD 01 \/ ACTIVE/);
  assert.match(html, /ACCOUNT LINK PENDING/);
  assert.doesNotMatch(html, /FIELD 01 \/ LIVE/);
  assert.doesNotMatch(html, /FOLLOW PATTERN/);
  assert.match(html, /<canvas[^>]*aria-hidden="true"|aria-hidden="true"[^>]*>[\s\S]*<canvas/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Building your site/i);
});

test("uses the forwarded request origin for absolute social images", async () => {
  const response = await render({
    url: "http://internal.invalid/",
    headers: {
      "x-forwarded-host": "signal.pattern.test",
      "x-forwarded-proto": "https",
    },
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(
    html,
    /https:\/\/signal\.pattern\.test\/brand\/pattern_og_1200x630_v01\.png/,
  );
  assert.doesNotMatch(
    html,
    /http:\/\/localhost:3000\/brand\/pattern_og_1200x630_v01\.png/,
  );
  assert.doesNotMatch(html, /rel="canonical"/i);
});

test("removes the starter preview and keeps motion progressive", async () => {
  const [page, layout, signalField, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/_components/SignalField.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /["']use client["']/);
  assert.match(page, /<SignalField \/>/);
  assert.match(layout, /themeColor:\s*"#07090C"/);
  assert.match(layout, /export async function generateMetadata/);
  assert.match(layout, /x-forwarded-host/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|WRANGLER_LOG_PATH=/);
  assert.match(signalField, /^"use client";/);
  assert.match(signalField, /seededRandom\(4663\)/);
  assert.match(signalField, /PULSE_INTERVAL = 4663/);
  assert.match(signalField, /prefers-reduced-motion/);
  assert.match(signalField, /ResizeObserver/);
  assert.match(signalField, /IntersectionObserver/);
  assert.doesNotMatch(
    signalField,
    /tone:\s*edgeBias\s*>\s*0\.93\s*\?\s*"cyan"/,
  );
  assert.match(signalField, /return \(\) => staticResizeObserver\.disconnect\(\)/);

  await Promise.all([
    assert.rejects(access(new URL("../app/_sites-preview", import.meta.url))),
    assert.rejects(access(new URL("../public/file.svg", import.meta.url))),
    assert.rejects(access(new URL("../public/globe.svg", import.meta.url))),
    assert.rejects(access(new URL("../public/window.svg", import.meta.url))),
  ]);

  await access(new URL("public/favicon.svg", projectRoot));
});
