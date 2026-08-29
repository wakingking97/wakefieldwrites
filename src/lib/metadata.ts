import type { Metadata } from "next";

export const SITE_NAME = "Kyler Wakefield";
export const SITE_URL = "https://wakefieldwrites.com";
const DEFAULT_OG_IMAGE = "/images/book-cover-flat.jpg";
const DEFAULT_OG_IMAGE_DIMENSIONS = { width: 1536, height: 1024 };

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: image, ...DEFAULT_OG_IMAGE_DIMENSIONS }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
