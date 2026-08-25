import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* The film is one page. Listing six fragments as separate URLs would be a
   lie told to a crawler, so it isn't done here. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
