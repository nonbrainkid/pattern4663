import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { project } from "./_data/project";
import "./globals.css";

const TITLE = `${project.name} / $${project.symbol} \u2014 Look Beneath the Noise`;
const DESCRIPTION =
  `${project.name} / $${project.symbol} is a live, independent culture coin and shared signal for people who find structure beneath noise, launched on ${project.chainName} (${project.chainId}).`;
const OG_IMAGE_PATH = "/brand/pattern_og_1200x630_v01.png";
const ICON_IMAGE_PATH = "/brand/pattern_x_avatar_800x800_v01.png";
const LOCAL_FALLBACK_ORIGIN = new URL("http://localhost:3000");
const VALID_HOST = /^(?:\[[0-9a-f:.]+\]|[a-z0-9.-]+)(?::\d{1,5})?$/i;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function firstForwardedValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

function isLocalHostname(host: string) {
  const hostname = host.replace(/^\[|\](?::\d+)?$|:\d+$/g, "").toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function requestOrigin(headerStore: { get(name: string): string | null }) {
  const host =
    firstForwardedValue(headerStore.get("x-forwarded-host")) ??
    firstForwardedValue(headerStore.get("host"));

  if (!host || !VALID_HOST.test(host)) return LOCAL_FALLBACK_ORIGIN;

  const forwardedProtocol = firstForwardedValue(
    headerStore.get("x-forwarded-proto"),
  )?.toLowerCase();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : isLocalHostname(host)
        ? "http"
        : "https";

  try {
    const origin = new URL(`${protocol}://${host}`);
    return new URL(origin.origin);
  } catch {
    return LOCAL_FALLBACK_ORIGIN;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const metadataBase = project.canonicalUrl
    ? new URL(project.canonicalUrl)
    : requestOrigin(requestHeaders);
  const imageUrl = new URL(OG_IMAGE_PATH, metadataBase).href;

  return {
    metadataBase,
    title: TITLE,
    description: DESCRIPTION,
    ...(project.canonicalUrl
      ? { alternates: { canonical: project.canonicalUrl } }
      : {}),
    icons: {
      icon: [{ url: ICON_IMAGE_PATH, type: "image/png", sizes: "800x800" }],
      shortcut: [{ url: ICON_IMAGE_PATH, type: "image/png", sizes: "800x800" }],
      apple: [{ url: ICON_IMAGE_PATH, type: "image/png", sizes: "800x800" }],
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${project.name} \u2014 signal emerging from noise`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [imageUrl],
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07090C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
