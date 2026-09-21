export const siteConfig = {
  name: "Homeward",
  description:
    "A social platform where verified rescue centers post animals for adoption and people browse, like, comment, and chat their way to a new companion.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
