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
  canonicalUrl: "https://pattern4663.com",
  launchVenue: null,
  explorerUrl: null,
  disclosures: Object.freeze({
    independence:
      "PATTERN is an independent culture coin designed for Robinhood Chain. It is not issued, sponsored, endorsed, or operated by Robinhood.",
    marketRisk:
      "No listing, financial return, or utility is promised. PATTERN ATLAS is editorial and educational content, not financial advice or a trading signal.",
    verification:
      "Verify the contract address on the canonical domain and Robinhood Chain explorer before interacting.",
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
