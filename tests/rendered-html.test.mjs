import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import {
  canonicalShareUrl,
  createFieldNote,
  INITIAL_RESOLVER_STATE,
  normalizeLens,
  PHASES,
  resolveGuess,
  resolverReducer,
  shareOutcome,
} from "../app/_components/patternLabModel.mjs";

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
  assert.match(html, /<title>PATTERN \/ \$P4663 (?:\u2014|&#x2014;|&mdash;) Look Beneath the Noise<\/title>/i);
  assert.match(html, /LOOK BENEATH[\s\S]*THE NOISE\./);
  assert.match(html, /PATTERN \/[\s\S]{0,80}\$P4663/);
  assert.match(html, /\$P4663/);
  assert.match(html, /The world becomes recognizable through patterns\./);
  assert.match(html, /LIVE \/ CHAIN[\s\S]{0,40}4663/);
  assert.match(html, /CONTRACT PUBLISHED/);
  assert.match(html, /ROBINHOOD CHAIN/);
  assert.match(html, /not issued, sponsored, endorsed, or operated by Robinhood or pons/i);
  assert.match(html, /No listing, financial return, or utility is promised\./i);
  assert.match(html, /LOOK TWICE\. VERIFY EVERYTHING\./);
  assert.match(html, /pattern_og_1200x630_v01\.png/);
  assert.match(html, /pattern_x_avatar_800x800_v01\.png/);
  assert.match(html, /PERCEPTION FIELD \/ ACTIVE/);
  assert.match(html, /FOLLOW @PATTERN4663/i);
  assert.match(html, /href="https:\/\/x\.com\/Pattern4663"/i);
  assert.match(html, /target="_blank"/i);
  assert.match(html, /rel="noopener noreferrer"/i);
  assert.doesNotMatch(html, /ACCOUNT LINK PENDING/);
  assert.match(html, /TRADE ON PONS/);
  assert.match(html, /VERIFY ON EXPLORER/);
  assert.match(html, /0xB74E8B647517813D8b3790240e98F2E9A09cf5a3/);
  assert.match(html, /href="https:\/\/www\.ponsfamily\.com\/launchpad\/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3"/i);
  assert.match(html, /href="https:\/\/robinhoodchain\.blockscout\.com\/token\/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3"/i);
  assert.doesNotMatch(html, /PRE-LAUNCH|CONTRACT NOT PUBLISHED|token is not live/i);
  assert.match(html, /PATTERN ATLAS/);
  assert.match(html, /ONE INSTINCT\. FOUR SYSTEMS\./);
  assert.match(html, /SYNTHETIC \/ NOT MARKET DATA/);
  assert.match(html, /PATTERN FOUND (?:≠|&#x2260;) FUTURE GUARANTEED/);
  assert.match(html, /RECOGNITION HAS[\s\S]*A STRUCTURE\./);
  assert.match(html, /DON(?:&#x27;|')T TAKE THE CLAIM[\s\S]*ON FAITH\./i);
  assert.match(html, /LOOK TWICE\.[\s\S]*TEST WHAT YOU SEE\./);
  assert.match(html, /data-pattern-resolver="guided"/);
  for (const phase of PHASES) assert.match(html, new RegExp(`>${phase}<`));
  assert.match(html, /for="pattern-resolution"[\s\S]*RESOLUTION/);
  assert.match(html, /aria-valuetext="NOISE, resolution 0 of 2"/);
  assert.match(html, /data-field-note-state="locked"/);
  assert.match(html, /data-manual-fallback="inactive"/);
  assert.match(html, /FIELD NOTE \/ LOCKED/);
  assert.doesNotMatch(html, /SHARE FIELD NOTE \/ LOCKED/);
  assert.doesNotMatch(html, /WHAT COMPLETES THE LOOP\?|EARNED FIELD NOTE|SIGNAL \/ 4663[\s\S]{0,30}RESOLVED/i);
  assert.doesNotMatch(html, /we compared|winner pattern/i);
  assert.doesNotMatch(html, /FIELD 01 \/ LIVE/);
  const canvasTags = html.match(/<canvas\b[^>]*>/gi) ?? [];
  assert.equal(canvasTags.length, 3);
  for (const canvasTag of canvasTags) {
    assert.match(canvasTag, /\baria-hidden="true"/i);
  }
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Building your site/i);
});

test("uses the canonical production origin for social metadata", async () => {
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
    /https:\/\/pattern4663\.com\/brand\/pattern_og_1200x630_v01\.png/,
  );
  assert.doesNotMatch(
    html,
    /http:\/\/localhost:3000\/brand\/pattern_og_1200x630_v01\.png/,
  );
  assert.match(html, /rel="canonical" href="https:\/\/pattern4663\.com"/i);
});

test("the resolver model distinguishes observation from an earned signal", () => {
  assert.deepEqual(resolveGuess(4), {
    correct: false,
    phase: 2,
    message: "Look for the repeating interval.",
  });
  assert.deepEqual(resolveGuess(3), {
    correct: true,
    phase: 3,
    message: "Signal resolved.",
  });

  const manuallyRevealed = resolverReducer(INITIAL_RESOLVER_STATE, {
    type: "SET_PHASE",
    phase: 3,
  });
  assert.equal(manuallyRevealed.phase, 2);
  assert.equal(manuallyRevealed.solved, false);
  assert.equal(manuallyRevealed.attempts, 0);

  const wrongGuess = resolverReducer(
    { ...INITIAL_RESOLVER_STATE, phase: 2 },
    { type: "GUESS", value: 6 },
  );
  assert.equal(wrongGuess.phase, 2);
  assert.equal(wrongGuess.solved, false);
  assert.equal(wrongGuess.attempts, 1);
  assert.equal(wrongGuess.message, "Look for the repeating interval.");

  const solved = resolverReducer(wrongGuess, { type: "GUESS", value: 3 });
  assert.equal(solved.phase, 3);
  assert.equal(solved.solved, true);
  assert.equal(solved.attempts, 2);

  const revisitSignal = resolverReducer(
    { ...solved, phase: 1 },
    { type: "SET_PHASE", phase: 3 },
  );
  assert.equal(revisitSignal.phase, 3);
  assert.equal(revisitSignal.solved, true);

  assert.equal(normalizeLens("  code "), "CODE");
  assert.equal(normalizeLens("prices"), null);
  const note = createFieldNote("  code ");
  assert.match(note, /OBSERVER \/ CODE/);
  assert.match(note, /SIGNAL \/ 4663/);
  assert.match(note, /PATTERN \/ P4663/);
  assert.doesNotMatch(note, /profit|return|buy|guaranteed|contract|launch/i);
  assert.equal(canonicalShareUrl("https://pattern4663.com/#lab"), "https://pattern4663.com/");

  assert.equal(shareOutcome("native"), "shared");
  assert.equal(shareOutcome("clipboard"), "copied");
  assert.equal(shareOutcome("native", { name: "AbortError" }), "cancelled");
  assert.equal(shareOutcome("clipboard", new Error("denied")), "failed");
});

test("removes the starter preview and keeps motion progressive", async () => {
  const [page, layout, project, signalField, patternLab, patternAtlas, styles, packageJson, cleanScript] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/_data/project.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/_components/SignalField.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/_components/PatternLab.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/_components/PatternAtlas.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../scripts/clean-next.mjs", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /["']use client["']/);
  assert.match(page, /<SignalField \/>/);
  assert.match(page, /from "\.\/_data\/project"/);
  assert.match(layout, /from "\.\/_data\/project"/);
  assert.match(project, /name:\s*"PATTERN"/);
  assert.match(project, /symbol:\s*"P4663"/);
  assert.match(project, /chainId:\s*4663/);
  assert.match(project, /status:\s*"live"/);
  assert.match(project, /contractAddress:\s*"0xB74E8B647517813D8b3790240e98F2E9A09cf5a3"/);
  assert.match(project, /decimals:\s*18/);
  assert.match(project, /totalSupply:\s*1_000_000_000/);
  assert.match(project, /launchVenue:\s*"pons"/);
  assert.match(project, /https:\/\/www\.ponsfamily\.com\/launchpad\/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3/);
  assert.match(project, /https:\/\/robinhoodchain\.blockscout\.com\/token\/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3/);
  assert.match(project, /xHandle:\s*"@Pattern4663"/);
  assert.match(project, /xUrl:\s*"https:\/\/x\.com\/Pattern4663"/);
  assert.match(project, /canonicalUrl:\s*"https:\/\/pattern4663\.com"/);
  assert.doesNotMatch(project, /PRE-LAUNCH|NOT PUBLISHED|status:\s*"prelaunch"/i);
  assert.match(layout, /themeColor:\s*"#07090C"/);
  assert.match(layout, /export async function generateMetadata/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /ICON_IMAGE_PATH = "\/brand\/pattern_x_avatar_800x800_v01\.png"/);
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
  assert.match(patternLab, /type="range"/);
  assert.match(patternLab, /aria-valuetext/);
  assert.match(patternLab, /data-resolver-quiz="missing-interval"/);
  assert.match(patternLab, /max=\{solved \? 3 : 2\}/);
  assert.match(patternLab, /navigator\.share/);
  assert.match(patternLab, /navigator\.clipboard\?\.writeText/);
  assert.match(patternLab, /Field note shared\./);
  assert.match(patternLab, /Field note copied to clipboard\./);
  assert.match(patternLab, /Automatic sharing failed\./);
  assert.match(patternLab, /aria-live="polite"/);
  assert.match(patternLab, /readOnly/);
  assert.match(patternLab, /data-manual-fallback/);
  assert.match(patternAtlas, /seed\.left\.toFixed\(6\)/);
  assert.match(patternAtlas, /seed\.top\.toFixed\(6\)/);
  assert.match(patternAtlas, /seed\.size\.toFixed\(4\)/);
  assert.match(patternAtlas, /String\(seed\.index\)/);
  assert.match(patternAtlas, /seed\.opacity\.toFixed\(6\)/);
  assert.match(styles, /--muted:\s*#a8b4c0/i);
  assert.match(styles, /--muted-subtle:\s*#96a3af/i);
  assert.match(styles, /grid-template-columns:\s*176px minmax\(0, 1fr\) 372px/);
  assert.match(styles, /\.resolver__context/);
  assert.match(styles, /\.resolver__control input\[type="range"\][^}]*height:\s*44px[^}]*min-height:\s*44px/s);
  assert.doesNotMatch(
    styles,
    /color:\s*#(?:697480|687480|66717c|67737f|626e7a|616d79|66727e|697581|68737f)\b/i,
  );
  assert.match(packageJson, /node scripts\/clean-next\.mjs && next build/);
  assert.match(cleanScript, /basename\(buildDirectory\) !== "\.next"/);
  assert.match(cleanScript, /dirname\(buildDirectory\) !== repositoryRoot/);
  assert.match(cleanScript, /rmSync\(buildDirectory, \{ recursive: true, force: true \}\)/);

  await Promise.all([
    assert.rejects(access(new URL("../app/_sites-preview", import.meta.url))),
    assert.rejects(access(new URL("../public/file.svg", import.meta.url))),
    assert.rejects(access(new URL("../public/globe.svg", import.meta.url))),
    assert.rejects(access(new URL("../public/window.svg", import.meta.url))),
  ]);

  await access(new URL("public/brand/pattern_x_avatar_800x800_v01.png", projectRoot));
});

test("publishes the exact machine-readable live token record", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../public/token.json", import.meta.url), "utf8"),
  );

  assert.equal(manifest.name, "Pattern");
  assert.equal(manifest.symbol, "P4663");
  assert.equal(manifest.chainId, 4663);
  assert.equal(manifest.chain, "Robinhood Chain");
  assert.equal(manifest.status, "live");
  assert.equal(manifest.contractAddress, "0xB74E8B647517813D8b3790240e98F2E9A09cf5a3");
  assert.equal(manifest.decimals, 18);
  assert.equal(manifest.totalSupply, 1_000_000_000);
  assert.equal(manifest.updated, "2026-08-12");
  assert.deepEqual(manifest.officialLinks, {
    website: "https://pattern4663.com",
    x: "https://x.com/Pattern4663",
    explorer: "https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3",
    launchVenue: "https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3",
  });
  assert.match(manifest.disclosure, /independent experimental culture coin launched on Robinhood Chain via pons/i);
  assert.match(manifest.disclosure, /not issued, sponsored, endorsed, or operated by Robinhood or pons/i);
  assert.doesNotMatch(JSON.stringify(manifest), /PRE-LAUNCH|CONTRACT NOT PUBLISHED|not deployed or published/i);
});
