export type LaunchStatus = "live";

export type ProjectDisclosures = Readonly<{
  independence: string;
  marketRisk: string;
  verification: string;
}>;

export type ProjectConfig = Readonly<{
  name: string;
  onchainName: string;
  symbol: string;
  chainName: string;
  chainId: number;
  status: LaunchStatus;
  contractAddress: string;
  decimals: number;
  totalSupply: number;
  xHandle: string;
  xUrl: string;
  canonicalUrl: string;
  launchVenue: string;
  launchUrl: string;
  explorerUrl: string;
  disclosures: ProjectDisclosures;
}>;

export const project: ProjectConfig = Object.freeze({
  name: "PATTERN",
  onchainName: "Pattern",
  symbol: "P4663",
  chainName: "Robinhood Chain",
  chainId: 4663,
  status: "live",
  contractAddress: "0xB74E8B647517813D8b3790240e98F2E9A09cf5a3",
  decimals: 18,
  totalSupply: 1_000_000_000,
  xHandle: "@Pattern4663",
  xUrl: "https://x.com/Pattern4663",
  canonicalUrl: "https://pattern4663.com",
  launchVenue: "pons",
  launchUrl:
    "https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3",
  explorerUrl:
    "https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3",
  disclosures: Object.freeze({
    independence:
      "PATTERN is an independent culture coin launched on Robinhood Chain via pons. It is not issued, sponsored, endorsed, or operated by Robinhood or pons.",
    marketRisk:
      "The token is experimental and volatile. Availability can depend on jurisdiction. No listing, financial return, or utility is promised. PATTERN ATLAS is editorial and educational content, not financial advice or a trading signal.",
    verification:
      "Verify the full contract address on the canonical domain and Robinhood Chain explorer before interacting.",
  }),
});

export function statusLabel(status: LaunchStatus = project.status) {
  return status.toUpperCase();
}

export function contractLabel(address: string = project.contractAddress) {
  return address;
}
