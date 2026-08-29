/** Absolute origin, used for canonicals, the sitemap and structured data. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://insertname.in").replace(
  /\/$/,
  "",
);
