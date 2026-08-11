export type LaunchStatus = "prelaunch" | "live";

export type ProjectDisclosures = Readonly<{
  independence: string;
  marketRisk: string;
  verification: string;
  prelaunch: string;
}>;

export type ProjectConfig = Readonly<{
  name: string;
  symbol: string;
  chainName: string;
  chainId: number;
  status: LaunchStatus;
  contractAddress: string | null;
  xHandle: string | null;
  xUrl: string | null;
  canonicalUrl: string | null;
  launchVenue: string | null;
  explorerUrl: string | null;
  disclosures: ProjectDisclosures;
}>;

export const project: ProjectConfig = Object.freeze({
  name: "PATTERN",
  symbol: "P4663",
  chainName: "Robinhood Chain",
  chainId: 4663,
  status: "prelaunch",
  contractAddress: null,
  xHandle: "@Pattern4663",
  xUrl: "https://x.com/Pattern4663",
  canonicalUrl: null,
  launchVenue: null,
  explorerUrl: null,
  disclosures: Object.freeze({
    independence:
      "PATTERN is an independent community project. Not affiliated with or endorsed by Robinhood Markets, Inc.",
    marketRisk:
      "No promise of profit, utility, or listing. Crypto assets are risky.",
    verification:
      "Verify the canonical contract address before interacting.",
    prelaunch:
      "The token contract is not deployed or published. No contract address is official before this record is updated.",
  }),
});

export function statusLabel(status: LaunchStatus = project.status) {
  return status === "prelaunch" ? "PRE-LAUNCH" : "LIVE";
}

export function contractLabel(address: string | null = project.contractAddress) {
  return address ?? "NOT PUBLISHED";
}
