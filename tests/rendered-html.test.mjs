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
  assert.match(html, /SYMBOL \/[\s\S]{0,80}P4663/);
  assert.match(html, /\$P4663/);
  assert.match(html, /Everything is noise until you see the pattern\./);
  assert.match(html, /PRE-LAUNCH[\s\S]{0,80}\/ CONTRACT[\s\S]{0,80}NOT PUBLISHED/);
  assert.match(html, /ROBINHOOD CHAIN/);
  assert.match(html, /Not affiliated with or endorsed by Robinhood Markets, Inc\./);
  assert.match(html, /No promise of profit, utility, or listing\./);
  assert.match(html, /SEE STRUCTURE\. VERIFY EVERYTHING\./);
  assert.match(html, /pattern_og_1200x630_v01\.png/);
  assert.match(html, /FIELD 01 \/ ACTIVE/);
  assert.match(html, /FOLLOW @PATTERN4663/i);
  assert.match(html, /href="https:\/\/x\.com\/Pattern4663"/i);
  assert.match(html, /target="_blank"/i);
  assert.match(html, /rel="noopener noreferrer"/i);
  assert.doesNotMatch(html, /ACCOUNT LINK PENDING/);
  assert.match(html, /CONTRACT NOT LIVE/);
  assert.match(html, /PATTERN ATLAS/);
  assert.match(html, /ORDER HIDES EVERYWHERE\./);
  assert.match(html, /ILLUSTRATIVE \/ NOT MARKET DATA/);
  assert.match(html, /PATTERN FOUND (?:≠|&#x2260;) FUTURE GUARANTEED/);
  assert.doesNotMatch(html, /we compared|winner pattern/i);
  assert.doesNotMatch(html, /FIELD 01 \/ LIVE/);
  assert.doesNotMatch(
    html,
    /(?:contract|token)\s+(?:is\s+)?(?:live|born)|verified contract address|0x[a-f0-9]{40}/i,
  );
  const canvasTags = html.match(/<canvas\b[^>]*>/gi) ?? [];
  assert.equal(canvasTags.length, 3);
  for (const canvasTag of canvasTags) {
    assert.match(canvasTag, /\baria-hidden="true"/i);
  }
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
  const [page, layout, project, signalField, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/_data/project.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/_components/SignalField.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /["']use client["']/);
  assert.match(page, /<SignalField \/>/);
  assert.match(page, /from "\.\/_data\/project"/);
  assert.match(layout, /from "\.\/_data\/project"/);
  assert.match(project, /name:\s*"PATTERN"/);
  assert.match(project, /symbol:\s*"P4663"/);
  assert.match(project, /chainId:\s*4663/);
  assert.match(project, /status:\s*"prelaunch"/);
  assert.match(project, /contractAddress:\s*null/);
  assert.match(project, /xHandle:\s*"@Pattern4663"/);
  assert.match(project, /xUrl:\s*"https:\/\/x\.com\/Pattern4663"/);
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
  assert.match(styles, /--muted:\s*#a8b4c0/i);
  assert.match(styles, /--muted-subtle:\s*#96a3af/i);
  assert.doesNotMatch(
    styles,
    /color:\s*#(?:697480|687480|66717c|67737f|626e7a|616d79|66727e|697581|68737f)\b/i,
  );

  await Promise.all([
    assert.rejects(access(new URL("../app/_sites-preview", import.meta.url))),
    assert.rejects(access(new URL("../public/file.svg", import.meta.url))),
    assert.rejects(access(new URL("../public/globe.svg", import.meta.url))),
    assert.rejects(access(new URL("../public/window.svg", import.meta.url))),
  ]);

  await access(new URL("public/favicon.svg", projectRoot));
});

test("publishes a truthful machine-readable prelaunch manifest", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../public/token.json", import.meta.url), "utf8"),
  );

  assert.equal(manifest.name, "PATTERN");
  assert.equal(manifest.symbol, "P4663");
  assert.equal(manifest.chainId, 4663);
  assert.equal(manifest.chain, "Robinhood Chain");
  assert.equal(manifest.status, "prelaunch");
  assert.equal(manifest.contractAddress, null);
  assert.equal(manifest.updated, "2026-08-11");
  assert.deepEqual(manifest.officialLinks, {
    website: null,
    x: "https://x.com/Pattern4663",
    explorer: null,
    launchVenue: null,
  });
  assert.match(manifest.disclosure, /not deployed or published/i);
  assert.doesNotMatch(
    JSON.stringify(manifest),
    /(?:contract|token)\s+(?:is\s+)?(?:live|born)|verified contract address|0x[a-f0-9]{40}/i,
  );
});
