const DEFAULT_SITE_URL = "https://invyra.up.railway.app";
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

type ShareEventData = {
  slug: string;
  name: string;
  date: string;
  bride_name?: string | null;
  groom_name?: string | null;
};

export function normalizeBaseUrl(rawUrl?: string | null): string {
  const value = rawUrl?.trim();
  if (!value) return DEFAULT_SITE_URL;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getConfiguredSiteUrl(): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getOpenInviteUrl(slug: string, origin?: string): string {
  const base = normalizeBaseUrl(origin ?? getConfiguredSiteUrl());
  return `${base}/open/${slug}`;
}

export function getEventInviteUrl(slug: string, origin?: string): string {
  const base = normalizeBaseUrl(origin ?? getConfiguredSiteUrl());
  return `${base}/evento/${slug}`;
}

export function formatShareDate(date: string): string {
  const safeInput = DATE_ONLY_RE.test(date) ? `${date}T12:00:00` : date;
  const parsed = new Date(safeInput);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getShareTitle(event: ShareEventData): string {
  const bride = event.bride_name?.trim();
  const groom = event.groom_name?.trim();

  if (bride && groom) return `${bride} y ${groom}`;
  if (bride || groom) return bride ?? groom ?? event.name;

  return event.name;
}

export function buildSuggestedWhatsAppMessage(event: ShareEventData, origin?: string): string {
  const openUrl = getOpenInviteUrl(event.slug, origin);
  const names = getShareTitle(event);
  const formattedDate = formatShareDate(event.date);

  const lines = [
    "Hola. Te comparto una invitacion muy especial.",
    names,
    formattedDate ? `Fecha: ${formattedDate}` : "",
    "",
    "Abre tu invitacion aqui:",
    openUrl,
  ];

  return lines.filter(Boolean).join("\n");
}
