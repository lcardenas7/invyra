import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OpenTeaserClient from "./OpenTeaserClient";
import { getPublicEventBySlug } from "@/lib/public-events";
import { formatShareDate, getConfiguredSiteUrl, getEventInviteUrl, getOpenInviteUrl, getShareTitle } from "@/lib/share";

type OpenPageProps = {
  params: Promise<{ slug: string }>;
};

const getEventCached = cache(async (slug: string) => getPublicEventBySlug(slug));

function buildOpenDescription(date: string): string {
  const formattedDate = formatShareDate(date);
  if (!formattedDate) return "Abre la invitacion interactiva en Invyra.";
  return `Te invitan a celebrar el ${formattedDate}. Abre la invitacion interactiva.`;
}

export async function generateMetadata({ params }: OpenPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventCached(slug);

  if (!event) {
    return {
      title: "Invitacion no disponible | Invyra",
      description: "Esta invitacion no esta disponible.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${getShareTitle(event)} te invitan`;
  const description = buildOpenDescription(event.date);
  const openUrl = getOpenInviteUrl(slug);
  const eventUrl = getEventInviteUrl(slug);
  const siteUrl = getConfiguredSiteUrl();
  const generatedOgImage = `${siteUrl}/open/${slug}/opengraph-image`;
  const ogImages = event.cover_image
    ? [
        { url: event.cover_image, alt: `Portada de ${getShareTitle(event)}` },
        { url: generatedOgImage, alt: `Invitacion de ${getShareTitle(event)}` },
      ]
    : [{ url: generatedOgImage, alt: `Invitacion de ${getShareTitle(event)}` }];

  return {
    title,
    description,
    alternates: { canonical: openUrl },
    openGraph: {
      title,
      description,
      type: "website",
      url: openUrl,
      siteName: "Invyra",
      locale: "es_CO",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((image) => image.url),
    },
    other: {
      "invyra:event-url": eventUrl,
    },
  };
}

export default async function OpenPage({ params }: OpenPageProps) {
  const { slug } = await params;
  const event = await getEventCached(slug);

  if (!event) {
    notFound();
  }

  return (
    <OpenTeaserClient
      eventPath={`/evento/${slug}`}
      title={getShareTitle(event)}
      dateLabel={formatShareDate(event.date)}
      coverImage={event.cover_image}
    />
  );
}
