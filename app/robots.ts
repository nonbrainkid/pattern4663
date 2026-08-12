import type { MetadataRoute } from "next";
import { project } from "./_data/project";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", project.canonicalUrl).href,
    host: project.canonicalUrl,
  };
}
