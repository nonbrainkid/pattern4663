import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  contractCopyAnalyticsEvent,
  copyExactContract,
} from "../app/verify/contractCopyModel.mjs";
import { project } from "../app/_data/project.ts";

async function render(url = "http://localhost/verify") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(url, { headers: { accept: "text/html" } }),
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

test("server-renders the canonical verification identity without JavaScript", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Verify PATTERN \/ \$P4663/);
  assert.match(html, /VERIFY THE[\s\S]*FULL SIGNAL\./);
  assert.match(html, /CANONICAL VERIFICATION \/ REV 01/);
  assert.match(html, /PATTERN(?:<!-- -->)? \/ (?:<!-- -->)?Pattern/);
  assert.match(html, /Robinhood Chain/);
  assert.match(html, />4663</);
  assert.match(html, new RegExp(project.contractAddress));
  assert.match(html, /COPY FULL CA/);
  assert.doesNotMatch(html, /data-pattern-event="contract_copy"/);
  assert.match(html, /JavaScript is unavailable[\s\S]*copy it manually/i);
  assert.match(html, /Never accept a contract address from a DM, reply, screenshot, or shortened snippet\./i);
  assert.match(html, /Never connect a wallet just to verify a token\./i);
  assert.match(html, /pons is a third-party venue\. Access and availability can depend on jurisdiction\./i);

  const canonicalLinks = [
    project.explorerUrl,
    project.launchUrl,
    project.xUrl,
    project.canonicalUrl,
  ];

  for (const url of canonicalLinks) {
    assert.match(html, new RegExp(`href="${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "i"));
  }

  for (const url of [project.explorerUrl, project.launchUrl, project.xUrl]) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      html,
      new RegExp(`href="${escaped}"[^>]*target="_blank"[^>]*rel="noopener noreferrer"`, "i"),
    );
  }

  assert.doesNotMatch(html, /CONNECT WALLET|LIVE PRICE|MARKET CAP|HOLDERS|GRADUATION/i);
  assert.match(html, /rel="canonical" href="https:\/\/pattern4663\.com\/verify"/i);
});

test("copy model preserves the exact contract payload and reports fallbacks", async () => {
  let payload = null;
  const copied = await copyExactContract(project.contractAddress, {
    async writeText(value) {
      payload = value;
    },
  });

  assert.equal(payload, project.contractAddress);
  assert.deepEqual(copied, { state: "copied", error: null });
  assert.deepEqual(contractCopyAnalyticsEvent(copied), {
    event: "contract_copy",
  });

  const unavailable = await copyExactContract(project.contractAddress, undefined);
  assert.deepEqual(unavailable, { state: "failed", error: "unavailable" });
  assert.equal(contractCopyAnalyticsEvent(unavailable), null);

  const denied = await copyExactContract(project.contractAddress, {
    async writeText() {
      throw new Error("denied");
    },
  });
  assert.deepEqual(denied, { state: "failed", error: "denied" });
  assert.equal(contractCopyAnalyticsEvent(denied), null);
});

test("verification routes and security policy use the canonical config", async () => {
  const [page, copyComponent, robots, sitemap, nextConfig, home, styles] = await Promise.all([
    readFile(new URL("../app/verify/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/_components/ContractCopy.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /from "\.\.\/_data\/project"/);
  assert.match(page, /<ContractCopy address=\{project\.contractAddress\}/);
  assert.doesNotMatch(page, /0xB74E8B647517813D8b3790240e98F2E9A09cf5a3/);
  assert.match(copyComponent, /navigator\.clipboard/);
  assert.match(copyComponent, /aria-live="polite"/);
  assert.match(copyComponent, /readOnly/);
  assert.doesNotMatch(copyComponent, /data-pattern-event="contract_copy"/);
  assert.match(copyComponent, /contractCopyAnalyticsEvent\(result\)/);
  assert.match(copyComponent, /dispatchPatternAnalytics\(analyticsEvent\)/);
  assert.match(
    copyComponent,
    /const analyticsEvent = contractCopyAnalyticsEvent\(result\);[\s\S]*if \(analyticsEvent\) dispatchPatternAnalytics\(analyticsEvent\)/,
  );
  assert.match(robots, /from "\.\/_data\/project"/);
  assert.match(robots, /\/sitemap\.xml/);
  assert.match(sitemap, /from "\.\/_data\/project"/);
  assert.match(sitemap, /new URL\("\/verify", project\.canonicalUrl\)/);
  assert.doesNotMatch(sitemap, /token\.json/);
  assert.match(nextConfig, /X-Content-Type-Options/);
  assert.match(nextConfig, /X-Frame-Options/);
  assert.match(nextConfig, /Referrer-Policy/);
  assert.match(nextConfig, /Permissions-Policy/);
  assert.doesNotMatch(nextConfig, /Content-Security-Policy/);
  assert.match(home, /href="\/verify"/);
  assert.match(home, /OPEN CANONICAL VERIFY RECORD/);
  assert.match(styles, /\.contract-copy__button[\s\S]*min-height:\s*48px/);
  assert.match(styles, /\.verify-contract code[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(
    styles,
    /@media \(max-width: 820px\)[\s\S]*\.site-nav \{[\s\S]*display:\s*contents;[\s\S]*\.site-nav a:not\(\.site-nav__verify\)[\s\S]*display:\s*none;[\s\S]*\.site-nav \.site-nav__verify[\s\S]*min-height:\s*44px/,
  );
});

test("robots and sitemap expose only the canonical public routes", async () => {
  const robotsResponse = await render("http://localhost/robots.txt");
  assert.equal(robotsResponse.status, 200);
  const robotsBody = await robotsResponse.text();
  assert.match(robotsBody, /User-Agent: \*/i);
  assert.match(robotsBody, /Allow: \//i);
  assert.match(robotsBody, /Sitemap: https:\/\/pattern4663\.com\/sitemap\.xml/i);
  assert.match(robotsBody, /Host: https:\/\/pattern4663\.com/i);

  const sitemapResponse = await render("http://localhost/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemapBody = await sitemapResponse.text();
  assert.match(sitemapBody, /<loc>https:\/\/pattern4663\.com<\/loc>/);
  assert.match(sitemapBody, /<loc>https:\/\/pattern4663\.com\/verify<\/loc>/);
  assert.doesNotMatch(sitemapBody, /token\.json/);
});
