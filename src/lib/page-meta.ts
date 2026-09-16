const SITE_URL = "https://gracefieldliveincare.vercel.app";

export function pageMeta(
  title: string,
  description: string,
  options?: { path?: string; noIndex?: boolean },
) {
  const url = options?.path ? `${SITE_URL}${options.path}` : SITE_URL;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `${SITE_URL}/apple-touch-icon.png` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: `${SITE_URL}/apple-touch-icon.png` },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (options?.noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }
  return meta;
}
