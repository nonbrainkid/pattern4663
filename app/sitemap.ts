import type { MetadataRoute } from "next";
import { project } from "./_data/project";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: project.canonicalUrl,
      lastModified: new Date("2026-08-12T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/verify", project.canonicalUrl).href,
      lastModified: new Date("2026-08-12T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
