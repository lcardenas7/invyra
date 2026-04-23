import { ImageResponse } from "next/og";
import { getPublicEventBySlug } from "@/lib/public-events";
import { formatShareDate, getShareTitle } from "@/lib/share";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type OpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  const title = event ? getShareTitle(event) : "Invyra";
  const dateLabel = event ? formatShareDate(event.date) : "Invitacion interactiva";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#f0ece4",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,169,110,0.22) 0%, transparent 72%), linear-gradient(145deg, #090a14 0%, #12152a 45%, #0a0d18 100%)",
          padding: "60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#c8a96e",
            marginBottom: 24,
          }}
        >
          Invyra
        </div>
        <div
          style={{
            fontSize: 82,
            lineHeight: 1.1,
            fontWeight: 700,
            maxWidth: 980,
            marginBottom: 18,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 34,
            opacity: 0.92,
            marginBottom: 24,
          }}
        >
          te invitan
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#d8c58d",
          }}
        >
          {dateLabel}
        </div>
      </div>
    ),
    size
  );
}

