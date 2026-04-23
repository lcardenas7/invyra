"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Heart, Calendar, MapPin, Clock, Users, Gift, 
  MessageCircle, Camera, ChevronDown, ExternalLink,
  Music, Pause, Play, Send, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { formatDate, formatTime, getTimeRemaining } from "@/lib/utils";
import { getTemplateById } from "@/data/templates";
import type { Event, Guest, Message } from "@/types";

export default function EventoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const introStorageKey = `invyra:intro-seen:${slug}`;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [introPhase, setIntroPhase] = useState<"teaser" | "opening" | "reveal" | "done">("teaser");
  const [showIntro, setShowIntro] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // RSVP State
  const [rsvpStep, setRsvpStep] = useState<"form" | "confirmed" | "declined">("form");
  const [rsvpData, setRsvpData] = useState({
    name: "",
    email: "",
    phone: "",
    companions: 0,
    message: "",
    status: "confirmed" as "confirmed" | "declined",
  });
  const [submitting, setSubmitting] = useState(false);

  // Message State
  const [newMessage, setNewMessage] = useState({ name: "", content: "" });
  const [sendingMessage, setSendingMessage] = useState(false);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

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
      const eventDateTime = new Date(`${event.date}T${event.time}`);
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

    if (prefersReducedMotion || saveDataEnabled || lowPowerDevice || alreadySeenIntro) {
      setIntroPhase("done");
      setShowIntro(false);
      setIsIntroComplete(true);
      return;
    }

    setIntroPhase("teaser");
    setShowIntro(true);
    setIsIntroComplete(false);
  }, [event, introStorageKey, loading, notFound]);

  useEffect(() => {
    if (!showIntro || introPhase === "done") return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (introPhase === "teaser") {
      timer = setTimeout(() => setIntroPhase("opening"), 1500);
    } else if (introPhase === "opening") {
      timer = setTimeout(() => setIntroPhase("reveal"), 1200);
    } else if (introPhase === "reveal") {
      timer = setTimeout(() => completeIntro(), 1400);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [completeIntro, introPhase, showIntro]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || slug === "demo") {
      // Demo mode
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
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
        email: rsvpData.email,
        phone: rsvpData.phone,
        companions: rsvpData.companions,
        message: rsvpData.message,
        status: rsvpData.status,
      });

    if (!error) {
      if (rsvpData.status === "confirmed") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setRsvpStep(rsvpData.status);
    }

    setSubmitting(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !newMessage.name || !newMessage.content) return;

    if (slug === "demo") {
      setMessages([
        { id: Date.now().toString(), event_id: "demo", guest_name: newMessage.name, content: newMessage.content, created_at: new Date().toISOString() },
        ...messages
      ]);
      setNewMessage({ name: "", content: "" });
      return;
    }

    setSendingMessage(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        event_id: event.id,
        guest_name: newMessage.name,
        content: newMessage.content,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages([data, ...messages]);
      setNewMessage({ name: "", content: "" });
    }

    setSendingMessage(false);
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

  const template = getTemplateById(event.template_id);
  const colors = template?.colors || {
    primary: "#D4AF37",
    secondary: "#FFFFFF",
    accent: "#1a1a1a",
    background: "#FDFBF7",
    text: "#2C2C2C"
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
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
            whileHover={introPhase === "teaser" ? { scale: 1.02 } : undefined}
          >
            <div className="relative h-52 w-72">
              <div className="absolute inset-0 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
                <motion.div
                  className="absolute left-0 right-0 top-0 h-1/2 origin-top bg-gradient-to-b from-amber-100 to-amber-50"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  animate={{ rotateX: introPhase === "teaser" ? 0 : -165 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.div
                  className="absolute bottom-3 left-4 right-4 overflow-hidden rounded-t-lg border border-black/10 bg-white"
                  animate={{
                    height: introPhase === "teaser" ? 112 : introPhase === "opening" ? 138 : 154,
                    y: introPhase === "teaser" ? 10 : 0,
                  }}
                  transition={{ duration: 0.8 }}
                >
                  {event.cover_image ? (
                    <motion.img
                      src={event.cover_image}
                      alt={event.name}
                      className="h-full w-full object-cover"
                      animate={{
                        opacity: introPhase === "reveal" ? 1 : 0.55,
                        scale: introPhase === "reveal" ? 1 : 1.04,
                        filter: introPhase === "reveal" ? "blur(0px)" : "blur(1.5px)",
                      }}
                      transition={{ duration: 0.6 }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center">
                      <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                        {event.bride_name} & {event.groom_name}
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow"
                  style={{ backgroundColor: colors.primary }}
                  animate={{ scale: introPhase === "teaser" ? 1 : 0, opacity: introPhase === "teaser" ? 1 : 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Heart className="h-5 w-5" />
                </motion.div>
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-600">
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
                {formatTime(`2000-01-01T${event.time}`)}
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
      <section className="py-20 px-4" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-12"
            style={{ fontFamily: 'Playfair Display, serif' }}
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
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6"
              >
                <span className="text-3xl md:text-5xl font-bold text-white block">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-white/80 text-sm md:text-base">{item.label}</span>
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
      <section className="py-20 px-4 bg-white/50">
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
              className="bg-white rounded-2xl p-8 shadow-lg text-center"
            >
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
                Fecha y Hora
              </h3>
              <p className="text-lg" style={{ color: colors.text }}>
                {formatDate(event.date)}
              </p>
              <p style={{ color: colors.primary }}>
                {formatTime(`2000-01-01T${event.time}`)}
              </p>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg text-center"
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
              className="mt-8 bg-white rounded-2xl p-8 shadow-lg text-center"
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

          {rsvpStep === "form" ? (
            <motion.form
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onSubmit={handleRsvpSubmit}
              className="bg-white rounded-2xl p-8 shadow-lg space-y-6"
            >
              <div>
                <Label htmlFor="rsvp-name">Tu nombre completo *</Label>
                <Input
                  id="rsvp-name"
                  value={rsvpData.name}
                  onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rsvp-email">Email</Label>
                <Input
                  id="rsvp-email"
                  type="email"
                  value={rsvpData.email}
                  onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rsvp-phone">Teléfono</Label>
                <Input
                  id="rsvp-phone"
                  type="tel"
                  value={rsvpData.phone}
                  onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rsvp-companions">¿Cuántos acompañantes traes?</Label>
                <Input
                  id="rsvp-companions"
                  type="number"
                  min={0}
                  max={10}
                  value={rsvpData.companions}
                  onChange={(e) => setRsvpData({ ...rsvpData, companions: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rsvp-message">Mensaje para los novios (opcional)</Label>
                <Textarea
                  id="rsvp-message"
                  value={rsvpData.message}
                  onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 h-12 text-white"
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
                  className="flex-1 h-12"
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
              className="bg-white rounded-2xl p-8 shadow-lg text-center"
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
                    Nos vemos en la celebración
                  </p>
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

      {/* Gift Registry */}
      {(event.gift_registry || event.bank_info) && (
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Gift className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
              <h2 
                className="text-3xl md:text-4xl font-bold mb-8"
                style={{ fontFamily: 'Playfair Display, serif', color: colors.text }}
              >
                Mesa de Regalos
              </h2>
              
              {event.gift_registry && (
                <a 
                  href={event.gift_registry}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white mb-6 transition-transform hover:scale-105"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Gift className="w-5 h-5" />
                  Ver mesa de regalos
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {event.bank_info && (
                <div className="bg-white rounded-2xl p-6 shadow-lg mt-6">
                  <h3 className="font-semibold mb-4" style={{ color: colors.text }}>
                    Información Bancaria
                  </h3>
                  <p className="whitespace-pre-line" style={{ color: colors.text, opacity: 0.8 }}>
                    {event.bank_info}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

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

          {/* Message Form */}
          <form onSubmit={handleSendMessage} className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Input
                placeholder="Tu nombre"
                value={newMessage.name}
                onChange={(e) => setNewMessage({ ...newMessage, name: e.target.value })}
                required
              />
              <Button 
                type="submit"
                disabled={sendingMessage || !newMessage.name || !newMessage.content}
                style={{ backgroundColor: colors.primary }}
                className="text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
            <Textarea
              placeholder="Escribe tu mensaje de buenos deseos..."
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              required
              rows={3}
            />
          </form>

          {/* Messages List */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-4 shadow-sm"
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
            Después del evento, comparte tus fotos con nosotros
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
  );
}
