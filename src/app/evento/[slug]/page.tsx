"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Heart, Calendar, MapPin, Clock, Users, Gift, 
  MessageCircle, Camera, ChevronDown, ExternalLink,
  Music, Pause, Play, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { combineDateAndTime, formatDate, formatTime, getTimeRemaining } from "@/lib/utils";
import { getTemplateById } from "@/data/templates";
import type { Event, Guest, Message } from "@/types";

type StoredGuestProfile = {
  name?: string;
  companions?: number;
};

const sanitizeCompanions = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(2, Math.max(0, Math.floor(value)));
};

const getStoredGuestProfile = (storageKey: string): StoredGuestProfile => {
  if (typeof window === "undefined") return {};

  const rawGuestProfile = window.localStorage.getItem(storageKey);
  if (!rawGuestProfile) return {};

  try {
    return JSON.parse(rawGuestProfile) as StoredGuestProfile;
  } catch {
    window.localStorage.removeItem(storageKey);
    return {};
  }
};

const getRsvpMaxCompanions = (event: Event | null): number => {
  if (!event?.canvas_data) return 0;

  try {
    const canvasData =
      typeof event.canvas_data === "string"
        ? JSON.parse(event.canvas_data)
        : event.canvas_data;

    if (
      canvasData &&
      typeof canvasData === "object" &&
      "rsvp" in canvasData &&
      canvasData.rsvp &&
      typeof canvasData.rsvp === "object" &&
      "max_companions_per_guest" in canvasData.rsvp
    ) {
      const rawValue = Number(canvasData.rsvp.max_companions_per_guest);
      return sanitizeCompanions(rawValue);
    }
  } catch {
    return 0;
  }

  return 0;
};

function ParticleCanvas({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      drift: number;
      twinkle: number;
      twinkleSpeed: number;
    }> = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    for (let i = 0; i < 55; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        drift: (Math.random() - 0.5) * 0.3,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let animationFrame = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += particle.drift;
        particle.twinkle += particle.twinkleSpeed;

        if (particle.y < -10) {
          particle.y = height + 10;
          particle.x = Math.random() * width;
        }

        const alpha = particle.opacity * (0.6 + 0.4 * Math.sin(particle.twinkle));
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 169, 110, ${alpha})`;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />;
}

export default function EventoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const introStorageKey = `invyra:intro-seen:${slug}`;
  const guestProfileStorageKey = `invyra:guest-profile:${slug}`;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [introPhase, setIntroPhase] = useState<"teaser" | "opening" | "reveal" | "done">("teaser");
  const [showIntro, setShowIntro] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [storedGuestProfile] = useState(() => getStoredGuestProfile(guestProfileStorageKey));
  const [submittedCompanions, setSubmittedCompanions] = useState(0);
  
  // RSVP State
  const [rsvpStep, setRsvpStep] = useState<"form" | "confirmed" | "declined">("form");
  const [rsvpData, setRsvpData] = useState({
    name: storedGuestProfile.name ?? "",
    companions: sanitizeCompanions(storedGuestProfile.companions ?? 0),
    message: "",
    status: "confirmed" as "confirmed" | "declined",
  });
  const [submitting, setSubmitting] = useState(false);

  // Message list State
  const [messageSentFromRsvp, setMessageSentFromRsvp] = useState(false);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const rsvpMaxCompanions = getRsvpMaxCompanions(event);

  const completeIntro = useCallback(() => {
    setIntroPhase("done");
    setShowIntro(false);
    setIsIntroComplete(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(introStorageKey, "1");
    }
  }, [introStorageKey]);

  const handleEnvelopeAction = () => {
    if (introPhase === "teaser") {
      setIntroPhase("opening");
      return;
    }

    if (introPhase === "reveal") {
      completeIntro();
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      // Demo event for preview
      if (slug === "demo") {
        setEvent({
          id: "demo",
          user_id: "demo",
          name: "María & Juan",
          slug: "demo",
          event_type: "wedding",
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          time: "17:00",
          location: "Hacienda Los Robles",
          location_url: "https://maps.google.com",
          template_id: "wedding-elegant-classic",
          canvas_data: JSON.stringify({ rsvp: { max_companions_per_guest: 1 } }),
          bride_name: "María",
          groom_name: "Juan",
          story: "Nos conocimos en una cafetería hace 5 años. Desde ese primer café, supimos que algo especial estaba comenzando. Después de muchas aventuras juntos, decidimos dar el siguiente paso y celebrar nuestro amor con todos ustedes.",
          dress_code: "Formal / Cocktail",
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Event);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: eventData, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error || !eventData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setEvent(eventData);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("event_id", eventData.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (messagesData) {
        setMessages(messagesData);
      }

      setLoading(false);
    };

    fetchEvent();
  }, [slug]);

  // Countdown timer
  useEffect(() => {
    if (!event) return;

    const updateCountdown = () => {
      const eventDateTime = combineDateAndTime(event.date, event.time);
      setCountdown(getTimeRemaining(eventDateTime));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    if (loading || notFound || !event || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navWithConnection = navigator as Navigator & { connection?: { saveData?: boolean } };
    const saveDataEnabled = navWithConnection.connection?.saveData === true;
    const lowPowerDevice =
      typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2;
    const alreadySeenIntro = window.localStorage.getItem(introStorageKey) === "1";

    const timeoutId = window.setTimeout(() => {
      if (prefersReducedMotion || saveDataEnabled || lowPowerDevice || alreadySeenIntro) {
        setIntroPhase("done");
        setShowIntro(false);
        setIsIntroComplete(true);
        return;
      }

      setIntroPhase("teaser");
      setShowIntro(true);
      setIsIntroComplete(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [event, introStorageKey, loading, notFound]);

  useEffect(() => {
    if (!showIntro || introPhase === "done") return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (introPhase === "teaser") {
      timer = setTimeout(() => setIntroPhase("opening"), 1900);
    } else if (introPhase === "opening") {
      timer = setTimeout(() => setIntroPhase("reveal"), 1500);
    } else if (introPhase === "reveal") {
      timer = setTimeout(() => completeIntro(), 1650);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [completeIntro, introPhase, showIntro]);

  useEffect(() => {
    if (!messageSentFromRsvp) return;

    const timeoutId = window.setTimeout(() => setMessageSentFromRsvp(false), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [messageSentFromRsvp]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const companionsForThisResponse =
      rsvpData.status === "confirmed"
        ? Math.min(rsvpMaxCompanions, sanitizeCompanions(rsvpData.companions))
        : 0;

    if (!event || slug === "demo") {
      // Demo mode
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (rsvpData.message.trim()) {
        setMessages((prev) => [
          {
            id: Date.now().toString(),
            event_id: "demo",
            guest_name: rsvpData.name,
            content: rsvpData.message.trim(),
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setMessageSentFromRsvp(true);
      }
      setSubmittedCompanions(companionsForThisResponse);
      setRsvpStep(rsvpData.status);
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("guests")
      .insert({
        event_id: event.id,
        name: rsvpData.name,
        companions: companionsForThisResponse,
        max_companions: rsvpMaxCompanions,
        status: rsvpData.status,
      });

    if (!error) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          guestProfileStorageKey,
          JSON.stringify({
            name: rsvpData.name.trim(),
            companions: companionsForThisResponse,
          })
        );
      }

      if (rsvpData.status === "confirmed") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (rsvpData.message.trim()) {
        const { data: insertedMessage, error: messageError } = await supabase
          .from("messages")
          .insert({
            event_id: event.id,
            guest_name: rsvpData.name,
            content: rsvpData.message.trim(),
          })
          .select()
          .single();

        if (!messageError && insertedMessage) {
          setMessages((prev) => [insertedMessage, ...prev]);
          setMessageSentFromRsvp(true);
        }
      }

      setSubmittedCompanions(companionsForThisResponse);
      setRsvpStep(rsvpData.status);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Heart className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando invitación...</p>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitación no encontrada</h1>
          <p className="text-gray-600 mb-6">Esta invitación no existe o no está disponible.</p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isWeddingTheme = event.event_type === "wedding";
  const template = getTemplateById(event.template_id);
  const colors = isWeddingTheme
    ? {
        primary: "#c8a96e",
        secondary: "#0e0e1c",
        accent: "#141428",
        background: "#080810",
        text: "#f0ece4",
      }
    : template?.colors || {
    primary: "#D4AF37",
    secondary: "#FFFFFF",
    accent: "#1a1a1a",
    background: "#FDFBF7",
    text: "#2C2C2C"
  };
  const cardClass = isWeddingTheme
    ? "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg"
    : "bg-white rounded-2xl shadow-lg";
  const sectionSoftClass = isWeddingTheme ? "py-20 px-4" : "py-20 px-4 bg-white/50";
  const rsvpInputClass = isWeddingTheme
    ? "mt-1 bg-white/10 border-white/20 text-[#f0ece4] placeholder:text-[#a09880]"
    : "mt-1";
  const giftSectionTitle = event.gift_registry ? "Mesa de Regalos" : "Regalos";
  const giftDetailsTitle = event.gift_registry ? "Información Bancaria" : "Lluvia de Sobres";

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: colors.background }}>
      <ParticleCanvas enabled={isWeddingTheme} />
      {isWeddingTheme && (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,169,110,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(100,80,160,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 20%, rgba(200,120,80,0.05) 0%, transparent 60%)",
            }}
          />
          <div className="pointer-events-none fixed left-1/2 top-1/2 z-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c8a96e1a]" />
          <div className="pointer-events-none fixed left-1/2 top-1/2 z-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c8a96e14]" />
        </>
      )}

      <div className="relative z-10">
      {/* Intro Animation */}
      {showIntro && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: colors.background }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            type="button"
            onClick={completeIntro}
            className="absolute right-4 top-4 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5"
            style={{ borderColor: colors.primary, color: colors.text }}
          >
            Saltar animacion
          </button>

          <motion.div
            className="relative cursor-pointer text-center"
            onClick={handleEnvelopeAction}
            whileHover={introPhase === "teaser" ? { scale: 1.04, y: -4 } : undefined}
          >
            <div className="relative h-64 w-80 sm:h-80 sm:w-[28rem]">
              <motion.div
                className="absolute -inset-7 rounded-full blur-2xl"
                style={{ background: "radial-gradient(circle, rgba(200,169,110,0.26) 0%, rgba(200,169,110,0) 70%)" }}
                animate={{ opacity: introPhase === "teaser" ? 0.55 : introPhase === "opening" ? 0.75 : 0.92, scale: introPhase === "reveal" ? 1.08 : 1 }}
                transition={{ duration: 0.55 }}
              />
              <div className={`absolute inset-0 overflow-hidden rounded-3xl shadow-2xl ${isWeddingTheme ? "border border-[#c8a96e4d] bg-gradient-to-br from-[#1a1a30] to-[#252540]" : "border border-black/10 bg-white"}`}>
                <motion.div
                  className={`absolute left-0 right-0 top-0 h-[54%] origin-top shadow-[0_18px_30px_rgba(0,0,0,0.25)] ${isWeddingTheme ? "bg-gradient-to-b from-[#1e1e38] to-[#16162a]" : "bg-gradient-to-b from-amber-100 to-amber-50"}`}
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  animate={{
                    rotateX: introPhase === "teaser" ? 0 : -178,
                    y: introPhase === "teaser" ? 0 : -4,
                  }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.div
                  className={`absolute bottom-4 left-6 right-6 overflow-hidden rounded-t-xl border shadow-[0_18px_38px_rgba(0,0,0,0.24)] ${isWeddingTheme ? "border-[#c8a96e33] bg-gradient-to-b from-[#f8f4ef] to-[#ede8e0]" : "border-black/10 bg-white"}`}
                  animate={{
                    height: introPhase === "teaser" ? 148 : introPhase === "opening" ? 198 : 230,
                    y: introPhase === "teaser" ? 18 : introPhase === "opening" ? -2 : -12,
                    rotateX: introPhase === "reveal" ? 0 : 5,
                  }}
                  transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  {event.cover_image ? (
                    <motion.img
                      src={event.cover_image}
                      alt={event.name}
                      className="h-full w-full object-cover"
                      animate={{
                        opacity: introPhase === "reveal" ? 1 : 0.55,
                        scale: introPhase === "reveal" ? 1 : 1.08,
                        y: introPhase === "reveal" ? 0 : 8,
                        filter: introPhase === "reveal" ? "blur(0px)" : "blur(1.5px)",
                      }}
                      transition={{ duration: 0.75 }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center">
                      <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                        {event.bride_name} & {event.groom_name}
                      </p>
                    </div>
                  )}
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/55 to-transparent"
                    animate={{
                      opacity: introPhase === "reveal" ? 1 : 0,
                      x: introPhase === "reveal" ? ["-120%", "130%"] : "-120%",
                    }}
                    transition={{ duration: 0.95, ease: "easeOut" }}
                  />
                </motion.div>

                <motion.div
                  className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow"
                  style={{ backgroundColor: colors.primary }}
                  animate={{ scale: introPhase === "teaser" ? 1 : 0, opacity: introPhase === "teaser" ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Heart className="h-6 w-6" />
                </motion.div>
              </div>

              <motion.div
                className="pointer-events-none absolute inset-0 rounded-[2rem] border border-[#c8a96e45]"
                animate={{
                  opacity: introPhase === "reveal" ? [0, 0.75, 0] : 0,
                  scale: introPhase === "reveal" ? [0.92, 1.04, 1.14] : 0.92,
                }}
                transition={{ duration: 0.9 }}
              />
            </div>

            <p className={`mt-6 text-sm sm:text-base tracking-[0.08em] ${isWeddingTheme ? "text-[#a09880]" : "text-gray-600"}`}>
              {introPhase === "teaser" && "Tu invitacion esta por abrirse"}
              {introPhase === "opening" && "Abriendo sobre..."}
              {introPhase === "reveal" && "Descubriendo invitacion"}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section 
        className="min-h-screen flex flex-col items-center justify-center relative px-4 py-20"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isIntroComplete ? 1 : 0, y: isIntroComplete ? 0 : 30 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center max-w-2xl mx-auto w-full"
        >
          {/* If event has a cover image (uploaded invitation), show it */}
          {event.cover_image ? (
            <div className="relative mx-auto max-w-md">
              <img
                src={event.cover_image}
                alt={event.name}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          ) : (
            <>
              <p 
                className="text-sm uppercase tracking-[0.3em] mb-6"
                style={{ color: colors.primary }}
              >
                Nuestra Boda
              </p>
              
              <h1 
                className="text-5xl md:text-7xl font-bold mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: colors.text }}
              >
                {event.bride_name}
              </h1>
              
              <p 
                className="text-4xl md:text-5xl mb-4"
                style={{ fontFamily: 'Great Vibes, cursive', color: colors.primary }}
              >
                &
              </p>
              
              <h1 
                className="text-5xl md:text-7xl font-bold mb-8"
                style={{ fontFamily: 'Playfair Display, serif', color: colors.text }}
              >
                {event.groom_name}
              </h1>

              <div 
                className="w-24 h-px mx-auto mb-8"
                style={{ backgroundColor: colors.primary }}
              />

              <p 
                className="text-xl md:text-2xl mb-2"
                style={{ color: colors.text }}
              >
                {formatDate(event.date)}
              </p>
              <p 
                className="text-lg"
                style={{ color: colors.primary }}
              >
                {formatTime(combineDateAndTime(event.date, event.time))}
              </p>
            </>
          )}
        </motion.div>

        {/* Scroll indicator */}
        {isIntroComplete && (
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-8 h-8" style={{ color: colors.primary }} />
          </motion.div>
        )}
      </motion.section>

      {isIntroComplete && (
        <>
      {/* Countdown Section */}
      <section
        className="py-20 px-4"
        style={isWeddingTheme ? undefined : { backgroundColor: colors.primary }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className={`text-3xl md:text-4xl font-bold mb-12 ${isWeddingTheme ? "text-[#f0ece4]" : "text-white"}`}
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Faltan
          </h2>
          
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            {[
              { value: countdown.days, label: "Días" },
              { value: countdown.hours, label: "Horas" },
              { value: countdown.minutes, label: "Minutos" },
              { value: countdown.seconds, label: "Segundos" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-4 md:p-6 ${isWeddingTheme ? "border border-[#c8a96e40] bg-[#c8a96e1a] backdrop-blur-sm" : "bg-white/20 backdrop-blur-sm"}`}
              >
                <span className={`block text-3xl md:text-5xl font-bold ${isWeddingTheme ? "text-[#f0ece4]" : "text-white"}`}>
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className={`text-sm md:text-base ${isWeddingTheme ? "text-[#a09880]" : "text-white/80"}`}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      {event.story && (
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Heart className="w-12 h-12 mx-auto mb-6" style={{ color: colors.primary }} />
              <h2 
                className="text-3xl md:text-4xl font-bold mb-8"
                style={{ fontFamily: 'Playfair Display, serif', color: colors.text }}
              >
                Nuestra Historia
              </h2>
              <p 
                className="text-lg leading-relaxed"
                style={{ color: colors.text, opacity: 0.8 }}
              >
                {event.story}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Event Details */}
      <section className={sectionSoftClass}>
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: 'Playfair Display, serif', color: colors.text }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Detalles del Evento
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Date & Time */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`${cardClass} p-8 text-center`}
            >
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
                Fecha y Hora
              </h3>
              <p className="text-lg" style={{ color: colors.text }}>
                {formatDate(event.date)}
              </p>
              <p style={{ color: colors.primary }}>
                {formatTime(combineDateAndTime(event.date, event.time))}
              </p>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`${cardClass} p-8 text-center`}
            >
              <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
                Lugar
              </h3>
              <p className="text-lg mb-4" style={{ color: colors.text }}>
                {event.location}
              </p>
              {event.location_url && (
                <a 
                  href={event.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white transition-colors"
                  style={{ backgroundColor: colors.primary }}
                >
                  <MapPin className="w-4 h-4" />
                  Ver en mapa
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          </div>

          {/* Dress Code */}
          {event.dress_code && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`mt-8 ${cardClass} p-8 text-center`}
            >
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
                Código de Vestimenta
              </h3>
              <p className="text-lg" style={{ color: colors.primary }}>
                {event.dress_code}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* RSVP Section */}
      <section className="py-20 px-4" id="rsvp">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: 'Playfair Display, serif', color: colors.text }}
            >
              Confirma tu Asistencia
            </h2>
            <p style={{ color: colors.text, opacity: 0.8 }}>
              Por favor, confirma tu asistencia antes del evento
            </p>
          </motion.div>

          {(event.gift_registry || event.bank_info) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`${cardClass} p-6 mb-6`}
            >
              <h3 className="text-xl font-semibold mb-4 text-center" style={{ color: colors.text }}>
                {giftSectionTitle}
              </h3>

              {event.gift_registry && (
                <div className="text-center mb-4">
                  <a
                    href={event.gift_registry}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white transition-transform hover:scale-105"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Gift className="w-4 h-4" />
                    Ver mesa de regalos
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {event.bank_info && (
                <div className="rounded-xl border p-4" style={{ borderColor: isWeddingTheme ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)" }}>
                  <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                    {giftDetailsTitle}
                  </p>
                  <p className="text-sm whitespace-pre-line" style={{ color: colors.text, opacity: 0.8 }}>
                    {event.bank_info}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {rsvpStep === "form" ? (
            <motion.form
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onSubmit={handleRsvpSubmit}
              className={`${cardClass} p-8 space-y-6`}
            >
              <div>
                <Label htmlFor="rsvp-name" style={{ color: colors.text }}>
                  Tu nombre completo *
                </Label>
                <Input
                  id="rsvp-name"
                  value={rsvpData.name}
                  onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                  required
                  className={rsvpInputClass}
                />
              </div>


              {rsvpMaxCompanions > 0 && (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: colors.text }}>
                    Acompanantes
                  </p>

                  <label
                    htmlFor="rsvp-companion-0"
                    className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3"
                    style={{ borderColor: isWeddingTheme ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)" }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>
                      Sin acompanante
                    </span>
                    <input
                      id="rsvp-companion-0"
                      type="checkbox"
                      checked={rsvpData.companions === 0}
                      onChange={() => setRsvpData({ ...rsvpData, companions: 0 })}
                      className="h-5 w-5 accent-[#c8a96e]"
                    />
                  </label>

                  <label
                    htmlFor="rsvp-companion-1"
                    className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3"
                    style={{ borderColor: isWeddingTheme ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)" }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>
                      Llevare 1 acompanante
                    </span>
                    <input
                      id="rsvp-companion-1"
                      type="checkbox"
                      checked={rsvpData.companions === 1}
                      onChange={() => setRsvpData({ ...rsvpData, companions: 1 })}
                      className="h-5 w-5 accent-[#c8a96e]"
                    />
                  </label>

                  {rsvpMaxCompanions >= 2 && (
                    <label
                      htmlFor="rsvp-companion-2"
                      className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3"
                      style={{ borderColor: isWeddingTheme ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)" }}
                    >
                      <span className="text-sm" style={{ color: colors.text }}>
                        Llevare 2 acompanantes
                      </span>
                      <input
                        id="rsvp-companion-2"
                        type="checkbox"
                        checked={rsvpData.companions === 2}
                        onChange={() => setRsvpData({ ...rsvpData, companions: 2 })}
                        className="h-5 w-5 accent-[#c8a96e]"
                      />
                    </label>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="rsvp-message" style={{ color: colors.text }}>
                  Mensaje para los novios (opcional)
                </Label>
                <Textarea
                  id="rsvp-message"
                  value={rsvpData.message}
                  onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                  rows={3}
                  className={rsvpInputClass}
                  placeholder="Escribe unas palabras lindas..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="submit"
                  className="w-full h-12 text-white"
                  style={{ backgroundColor: colors.primary }}
                  disabled={submitting || !rsvpData.name}
                  onClick={() => setRsvpData({ ...rsvpData, status: "confirmed" })}
                >
                  <Check className="w-5 h-5 mr-2" />
                  {submitting ? "Enviando..." : "Confirmo asistencia"}
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full h-12"
                  disabled={submitting || !rsvpData.name}
                  onClick={() => setRsvpData({ ...rsvpData, status: "declined" })}
                >
                  <X className="w-5 h-5 mr-2" />
                  No podré asistir
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${cardClass} p-8 text-center`}
            >
              {rsvpStep === "confirmed" ? (
                <>
                  <div 
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                    ¡Gracias por confirmar!
                  </h3>
                  <p style={{ color: colors.text, opacity: 0.8 }}>
                    {submittedCompanions > 0
                      ? `Nos vemos en la celebracion con ${submittedCompanions} acompanante${submittedCompanions > 1 ? "s" : ""}`
                      : "Nos vemos en la celebracion"}
                  </p>
                  <p className="mt-3 text-sm" style={{ color: colors.text, opacity: 0.75 }}>
                    Recuerda: despues del evento podras subir fotos en el album colaborativo.
                  </p>
                  <Link href={`/evento/${slug}/album`} className="inline-flex mt-4">
                    <Button
                      size="sm"
                      className="text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Ir al album de fotos
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gray-200">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                    Lamentamos que no puedas asistir
                  </h3>
                  <p style={{ color: colors.text, opacity: 0.8 }}>
                    Te tendremos presente en nuestro día especial
                  </p>
                </>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Messages Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: 'Playfair Display, serif', color: colors.text }}
            >
              Mensajes para los Novios
            </h2>
          </motion.div>

          {messageSentFromRsvp && (
            <div className={`${cardClass} rounded-xl p-4 mb-6 text-sm`} style={{ color: colors.text }}>
              Gracias por tu mensaje. Quedo guardado junto con tu confirmacion.
              Cuando termine el evento, sube tus fotos aqui:{" "}
              <Link
                href={`/evento/${slug}/album`}
                className="underline underline-offset-4"
                style={{ color: colors.primary }}
              >
                /evento/{slug}/album
              </Link>
            </div>
          )}

          {/* Messages List */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${cardClass} rounded-xl p-4`}
              >
                <p className="font-medium mb-1" style={{ color: colors.primary }}>
                  {message.guest_name}
                </p>
                <p style={{ color: colors.text, opacity: 0.8 }}>
                  {message.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Album Link */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: colors.primary }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Camera className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Álbum de Fotos
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Confirma tu asistencia con tus datos y luego comparte tus fotos con nosotros
          </p>
          <p className="text-white/90 text-sm mb-4">
            Enlace directo del album: /evento/{slug}/album
          </p>
          <Link href={`/evento/${slug}/album`}>
            <Button 
              size="lg"
              className="bg-white hover:bg-gray-100"
              style={{ color: colors.primary }}
            >
              <Camera className="w-5 h-5 mr-2" />
              Ir al álbum
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ backgroundColor: colors.background }}>
        <Heart className="w-8 h-8 mx-auto mb-4" style={{ color: colors.primary }} />
        <p style={{ color: colors.text, opacity: 0.6 }}>
          {event.bride_name} & {event.groom_name}
        </p>
        <p className="text-sm mt-2" style={{ color: colors.text, opacity: 0.4 }}>
          Hecho con amor en Invyra
        </p>
      </footer>
        </>
      )}
      </div>
    </div>
  );
}
