"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

type OpenTeaserClientProps = {
  eventPath: string;
  title: string;
  dateLabel: string;
  coverImage?: string | null;
};

export default function OpenTeaserClient({
  eventPath,
  title,
  dateLabel,
  coverImage,
}: OpenTeaserClientProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"teaser" | "opening" | "ready">("teaser");
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const openTimer = window.setTimeout(() => setPhase("opening"), reducedMotion ? 150 : 800);
    const readyTimer = window.setTimeout(() => setPhase("ready"), reducedMotion ? 350 : 2000);
    const redirectTimer = window.setTimeout(() => router.replace(eventPath), reducedMotion ? 2200 : 5000);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(readyTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [eventPath, reducedMotion, router]);

  useEffect(() => {
    if (phase !== "ready") return;

    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 0 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(countdown);
  }, [phase]);

  const subtitle = useMemo(() => {
    if (!dateLabel) return "Tu invitacion esta lista";
    return `Tu invitacion para ${dateLabel}`;
  }, [dateLabel]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080810] px-4 py-8 text-[#f0ece4]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(200,169,110,0.18)_0%,transparent_72%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c8a96e1f]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">
        <div className="w-full rounded-3xl border border-[#c8a96e47] bg-[#0f1022e6] p-6 text-center shadow-2xl backdrop-blur-sm sm:p-8">
          <div className="relative mx-auto mb-7 h-44 w-72 sm:h-52 sm:w-80">
            <div className="absolute inset-0 rounded-3xl border border-[#c8a96e4d] bg-gradient-to-br from-[#1a1a30] to-[#252540] shadow-xl">
              <div
                className="absolute left-0 right-0 top-0 h-[52%] origin-top rounded-t-3xl border-b border-[#c8a96e40] bg-gradient-to-b from-[#1e1e38] to-[#16162a] shadow-[0_18px_30px_rgba(0,0,0,0.25)] transition-transform duration-1000"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  transform: phase === "teaser" ? "rotateX(0deg)" : "rotateX(-178deg)",
                }}
              />
              <div
                className="absolute left-6 right-6 bottom-4 overflow-hidden rounded-2xl border border-[#d8c58d3d] bg-[#f9f6ee] transition-all duration-700"
                style={{
                  height: coverImage ? "74%" : "64%",
                  transform: phase === "teaser" ? "translateY(26px)" : "translateY(0px)",
                  opacity: phase === "teaser" ? 0 : 1,
                }}
              >
                {coverImage ? (
                  <img src={coverImage} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#f7f2e6] to-[#eee4cf] px-4">
                    <p className="font-serif text-xl text-[#5b4720]">{title}</p>
                  </div>
                )}
              </div>
            </div>

            <div
              className="absolute -inset-6 rounded-full blur-2xl transition-opacity duration-500"
              style={{
                opacity: phase === "teaser" ? 0.45 : 0.85,
                background: "radial-gradient(circle, rgba(200,169,110,0.26) 0%, rgba(200,169,110,0) 70%)",
              }}
            />
          </div>

          <Heart className="mx-auto mb-3 h-8 w-8 text-[#c8a96e]" />
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#c8a96ecc]">Invyra</p>
          <h1 className="mb-2 text-3xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
            {title}
          </h1>
          <p className="mb-6 text-sm text-[#d8ceb9]">{subtitle}</p>

          <Button
            className="h-12 w-full bg-[#c8a96e] text-[#11131f] hover:bg-[#d3b77f]"
            onClick={() => router.replace(eventPath)}
          >
            Abrir invitacion
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="mt-4 text-xs text-[#d8ceb9]">
            {phase === "ready" ? `Abriendo automaticamente en ${secondsLeft}s...` : "Preparando experiencia..."}
          </p>

          <p className="mt-2 text-xs text-[#b9af97]">
            Si no abre, toca aqui:{" "}
            <Link className="underline underline-offset-2" href={eventPath}>
              ver invitacion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
