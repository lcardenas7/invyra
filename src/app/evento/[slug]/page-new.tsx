"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Heart, Calendar, MapPin, Clock, Users, Gift, 
  MessageCircle, Camera, ChevronDown, ExternalLink,
  Send, Check, X, Share2, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase";
import { formatDate, formatTime, getTimeRemaining } from "@/lib/utils";
import { getTemplateById } from "@/data/templates";
import type { Event, Guest, Message } from "@/types";

// Particle Canvas Component
function ParticleCanvas({ color = "#c8a96e" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const particles: Array<{
      x: number; y: number; size: number; speed: number;
      opacity: number; drift: number; twinkle: number; twinkleSpeed: number;
    }> = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    class Particle {
      x: number; y: number; size: number; speed: number;
      opacity: number; drift: number; twinkle: number; twinkleSpeed: number;

      constructor(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.size = Math.random() * 1.5 + 0.3;
        this.speed = Math.random() * 0.3 + 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.drift = (Math.random() - 0.5) * 0.3;
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      }

      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.twinkle += this.twinkleSpeed;
        if (this.y < -10) {
          this.x = Math.random() * W;
          this.y = H + 10;
        }
      }

      draw() {
        if (!ctx) return;
        const alpha = this.opacity * (0.6 + 0.4 * Math.sin(this.twinkle));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(")", `,${alpha})`).replace("rgb", "rgba");
        ctx.fill();
      }
    }

    for (let i = 0; i < 50; i++) {
      const p = new Particle(true);
      particles.push(p);
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        p.twinkle += p.twinkleSpeed;
        if (p.y < -10) {
          p.x = Math.random() * W;
          p.y = H + 10;
        }
        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.twinkle));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 169, 110, ${alpha})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

// Timeline Item Component
function TimelineItem({ time, title, description, isLast }: {
  time: string; title: string; description: string; isLast?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-[64px_1px_1fr] gap-x-4"
    >
      <span className="text-right pt-0.5 text-sm italic" style={{ color: "#c8a96e", fontFamily: "Cormorant Garamond, serif" }}>
        {time}
      </span>
      <div className="flex flex-col items-center pt-1.5">
        <div className="w-2 h-2 rounded-full border-2 border-[#c8a96e] bg-[#080810]" />
        {!isLast && <div className="flex-1 w-px bg-[#c8a96e]/20 min-h-[40px]" />}
      </div>
      <div className="pb-7">
        <div className="text-sm font-medium text-[#f0ece4]">{title}</div>
        <div className="text-xs text-[#a09880] leading-relaxed">{description}</div>
      </div>
    </motion.div>
  );
}

export default function EventoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const guestToken = searchParams.get("i"); // Token único del invitado
  
  const [event, setEvent] = useState<Event | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
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

  useEffect(() => {
    const fetchEvent = async () => {
      // Demo event for preview
      if (slug === "demo") {
        setEvent({
          id: "demo",
          user_id: "demo",
          name: "Valentina & Sebastián",
          slug: "demo",
          event_type: "wedding",
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          time: "18:00",
          location: "Hacienda El Rosal",
          location_url: "https://maps.google.com",
          template_id: "wedding-elegant-classic",
          bride_name: "Valentina",
          groom_name: "Sebastián",
          story: "Nos conocimos en una cafetería hace 5 años. Desde ese primer café, supimos que algo especial estaba comenzando.",
          dress_code: "Formal · Paleta dorada y marfil",
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Event);
        if (guestToken === "demo") {
          setGuest({
            id: "demo-guest",
            event_id: "demo",
            token: "demo",
            name: "María Pérez",
            status: "pending",
            companions: 0,
            max_companions: 2,
          } as Guest);
          setRsvpData(prev => ({ ...prev, name: "María Pérez" }));
        }
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

      // If guest token provided, fetch guest info
      if (guestToken) {
        const { data: guestData } = await supabase
          .from("guests")
          .select("*")
          .eq("event_id", eventData.id)
          .eq("token", guestToken)
          .single();

        if (guestData) {
          setGuest(guestData);
          setRsvpData(prev => ({ ...prev, name: guestData.name }));
          if (guestData.status !== "pending") {
            setRsvpStep(guestData.status as "confirmed" | "declined");
          }
        }
      }

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
  }, [slug, guestToken]);

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

  // Auto-open envelope after delay
  useEffect(() => {
    const timer = setTimeout(() => setIsEnvelopeOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRsvpSubmit = async (status: "confirmed" | "declined") => {
    if (!event) return;
    
    setRsvpData(prev => ({ ...prev, status }));
    setSubmitting(true);

    if (slug === "demo") {
      setTimeout(() => {
        if (status === "confirmed") {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setRsvpStep(status);
        setSubmitting(false);
      }, 1000);
      return;
    }

    const supabase = createClient();

    if (guest) {
      // Update existing guest
      const { error } = await supabase
        .from("guests")
        .update({
          status,
          companions: rsvpData.companions,
          message: rsvpData.message,
          responded_at: new Date().toISOString(),
        })
        .eq("id", guest.id);

      if (!error) {
        if (status === "confirmed") {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setRsvpStep(status);
      }
    } else {
      // Create new guest
      const { error } = await supabase
        .from("guests")
        .insert({
          event_id: event.id,
          name: rsvpData.name,
          email: rsvpData.email,
          phone: rsvpData.phone,
          companions: rsvpData.companions,
          message: rsvpData.message,
          status,
          responded_at: new Date().toISOString(),
        });

      if (!error) {
        if (status === "confirmed") {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setRsvpStep(status);
      }
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

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `💌 ¡Te comparto la invitación!\n${event?.bride_name} & ${event?.groom_name}\n\n👉 ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080810]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Heart className="w-16 h-16 text-[#c8a96e] mx-auto mb-4 animate-pulse" />
          <p className="text-[#a09880]">Cargando invitación...</p>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080810]">
        <div className="text-center">
          <Heart className="w-16 h-16 text-[#a09880] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#f0ece4] mb-2">Invitación no encontrada</h1>
          <p className="text-[#a09880] mb-6">Esta invitación no existe o no está disponible.</p>
          <Link href="/">
            <Button className="bg-[#c8a96e] hover:bg-[#b8944e] text-[#080810]">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const template = getTemplateById(event.template_id);
  const isDarkTheme = true; // Usar tema oscuro elegante

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0ece4]">
      {/* Particle Canvas */}
      <ParticleCanvas />

      {/* Envelope Animation */}
      {!isEnvelopeOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#080810]"
          initial={{ opacity: 1 }}
          animate={{ opacity: isEnvelopeOpen ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative cursor-pointer"
            onClick={() => setIsEnvelopeOpen(true)}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-72 h-52 relative">
              {/* Envelope Body */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a30] to-[#252540] border border-[#c8a96e]/30 rounded-lg overflow-hidden">
                {/* Flap */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#1e1e38] to-[#16162a] border-b border-[#c8a96e]/20"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "top center" }}
                  animate={{ rotateX: isEnvelopeOpen ? -160 : 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
                {/* Seal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#c8a96e] rounded-full flex items-center justify-center text-[#080810] font-bold text-lg z-10">
                  {event.bride_name?.[0]}
                </div>
                {/* Letter */}
                <motion.div
                  className="absolute bottom-0 left-4 right-4 h-24 bg-gradient-to-b from-[#f8f4ef] to-[#ede8e0] rounded-t-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </div>
            </div>
            <p className="text-center mt-6 text-[#a09880] text-sm">Toca para abrir</p>
          </motion.div>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section 
        className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(200,169,110,0.12)_0%,transparent_70%)]" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isEnvelopeOpen ? 1 : 0, y: isEnvelopeOpen ? 0 : 30 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center max-w-lg mx-auto relative z-10"
        >
          {/* If guest token, show personalized greeting */}
          {guest && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-[#c8a96e] mb-4"
            >
              Hola, {guest.name} ✨
            </motion.p>
          )}

          {/* Cover Image or Text */}
          {event.cover_image ? (
            <div className="relative mx-auto max-w-sm">
              <img
                src={event.cover_image}
                alt={event.name}
                className="w-full h-auto rounded-2xl shadow-2xl border border-[#c8a96e]/20"
              />
            </div>
          ) : (
            <>
              <p className="text-[11px] font-medium tracking-[6px] uppercase text-[#c8a96e] mb-5">
                Te invitamos a nuestra boda
              </p>
              
              <h1 
                className="text-5xl md:text-7xl font-light leading-tight mb-2"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                <em className="text-[#c8a96e]">{event.bride_name}</em>
                <span className="block text-2xl md:text-3xl text-[#c8a96e] italic my-2">&</span>
                <em className="text-[#c8a96e]">{event.groom_name}</em>
              </h1>

              <p className="text-[13px] tracking-[4px] uppercase text-[#a09880] mt-4">
                Se casan
              </p>

              <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#c8a96e] to-transparent mx-auto my-8" />

              <p 
                className="text-lg italic text-[#e8d5aa]"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                {formatDate(event.date)}
              </p>
            </>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-[10px] tracking-[3px] uppercase text-[#a09880]">Desliza</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#c8a96e] to-transparent" />
        </motion.div>
      </motion.section>

      {/* Countdown Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[9px] font-medium tracking-[5px] uppercase text-[#c8a96e]">Faltan</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c8a96e]/30 to-transparent" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#c8a96e]/10 to-[#c8a96e]/5 border border-[#c8a96e]/20 rounded-2xl p-8 backdrop-blur-sm"
          >
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { value: countdown.days, label: "Días" },
                { value: countdown.hours, label: "Horas" },
                { value: countdown.minutes, label: "Min" },
                { value: countdown.seconds, label: "Seg" },
              ].map((item, i) => (
                <div key={i} className="bg-[#c8a96e]/10 border border-[#c8a96e]/15 rounded-xl p-3 text-center">
                  <span 
                    className="text-3xl md:text-4xl font-light text-[#c8a96e] block"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {String(item.value).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] tracking-[2px] uppercase text-[#a09880]">{item.label}</span>
                </div>
              ))}
            </div>
            <p 
              className="text-center text-sm italic text-[#a09880]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              para el día más especial de nuestras vidas ✦
            </p>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[9px] font-medium tracking-[5px] uppercase text-[#c8a96e]">Los detalles</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c8a96e]/30 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c8a96e]/30 transition-colors"
            >
              <span className="text-2xl mb-3 block">📅</span>
              <span className="text-[9px] tracking-[3px] uppercase text-[#a09880] block mb-1">Fecha</span>
              <span className="text-[#f0ece4]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                {formatDate(event.date)}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c8a96e]/30 transition-colors"
            >
              <span className="text-2xl mb-3 block">🕕</span>
              <span className="text-[9px] tracking-[3px] uppercase text-[#a09880] block mb-1">Hora</span>
              <span className="text-[#f0ece4]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                <strong className="text-[#c8a96e]">{formatTime(`2000-01-01T${event.time}`)}</strong>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c8a96e]/30 transition-colors"
            >
              <span className="text-2xl mb-3 block">📍</span>
              <span className="text-[9px] tracking-[3px] uppercase text-[#a09880] block mb-1">Lugar</span>
              <span className="text-[#f0ece4]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                <strong className="text-[#c8a96e]">{event.location}</strong>
              </span>
            </motion.div>

            {event.dress_code && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c8a96e]/30 transition-colors"
              >
                <span className="text-2xl mb-3 block">👗</span>
                <span className="text-[9px] tracking-[3px] uppercase text-[#a09880] block mb-1">Dress code</span>
                <span className="text-[#f0ece4]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {event.dress_code}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Map Section */}
      {event.location_url && (
        <section className="py-16 px-6 relative z-10">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[9px] font-medium tracking-[5px] uppercase text-[#c8a96e]">Lugar</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#c8a96e]/30 to-transparent" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#14142880] border border-[#c8a96e]/15 rounded-2xl overflow-hidden"
            >
              {/* Map Visual */}
              <div className="h-44 bg-gradient-to-br from-[#0a0a1a] to-[#0d1020] relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(200,169,110,0.1) 40px,rgba(200,169,110,0.1) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(200,169,110,0.1) 40px,rgba(200,169,110,0.1) 41px)"
                }} />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-11 h-11 bg-[#c8a96e] rounded-full rounded-bl-none rotate-[-45deg] flex items-center justify-center shadow-lg shadow-[#c8a96e]/40"
                >
                  <span className="rotate-45 text-lg">📍</span>
                </motion.div>
              </div>
              
              <div className="p-4 flex items-center justify-between gap-3">
                <div>
                  <strong className="text-[#f0ece4] block" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                    {event.location}
                  </strong>
                </div>
                <a
                  href={event.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-4 py-2 border border-[#c8a96e]/30 rounded-lg text-[#c8a96e] text-sm hover:bg-[#c8a96e]/10 transition-colors"
                >
                  Ver mapa →
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Timeline/Program Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[9px] font-medium tracking-[5px] uppercase text-[#c8a96e]">Programa</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c8a96e]/30 to-transparent" />
          </div>

          <div className="space-y-0">
            <TimelineItem time="5:30" title="Recibimiento" description="Bienvenida a los invitados · cóctel de llegada" />
            <TimelineItem time="6:00" title="Ceremonia" description="Ceremonia religiosa o civil" />
            <TimelineItem time="7:30" title="Cena" description="Cena de gala con menú especial" />
            <TimelineItem time="9:30" title="Fiesta" description="Vals, primer baile · ¡a celebrar!" />
            <TimelineItem time="12:00" title="Brindis" description="Pastel y brindis final" isLast />
          </div>
        </div>
      </section>

      {/* Gallery Teaser */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[9px] font-medium tracking-[5px] uppercase text-[#c8a96e]">Álbum del evento</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c8a96e]/30 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
            {["🌹", "🌿", "🕯️", "💐", "🥂", "📸"].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square bg-gradient-to-br from-[#1a1030] to-[#0d0818] flex items-center justify-center text-3xl relative"
              >
                {emoji}
                <div className="absolute inset-0 bg-[#080810]/70 backdrop-blur-sm flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#a09880]" />
                </div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-center text-sm text-[#a09880] mt-4 leading-relaxed">
            El álbum se habilitará después del evento.<br />
            <a href="#rsvp" className="text-[#c8a96e] hover:underline">Confirma tu asistencia</a> para acceder.
          </p>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="py-16 px-6 relative z-10" id="rsvp">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[9px] font-medium tracking-[5px] uppercase text-[#c8a96e]">Confirmar asistencia</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c8a96e]/30 to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#c8a96e]/10 to-[#c8a96e]/5 border border-[#c8a96e]/15 rounded-3xl p-8"
          >
            {rsvpStep === "form" ? (
              <>
                <h2 
                  className="text-3xl font-light italic text-center mb-2"
                  style={{ fontFamily: "Cormorant Garamond, serif" }}
                >
                  ¿Nos acompañas?
                </h2>
                <p className="text-sm text-[#a09880] text-center mb-8">
                  Por favor confirma tu asistencia
                </p>

                <div className="space-y-4">
                  {!guest && (
                    <>
                      <div>
                        <label className="block text-[10px] tracking-[2px] uppercase text-[#a09880] mb-2 font-medium">
                          Tu nombre completo
                        </label>
                        <input
                          type="text"
                          value={rsvpData.name}
                          onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                          placeholder="Ej: María Pérez"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f0ece4] placeholder-white/20 focus:border-[#c8a96e]/50 focus:bg-[#c8a96e]/5 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[2px] uppercase text-[#a09880] mb-2 font-medium">
                          Tu WhatsApp (opcional)
                        </label>
                        <input
                          type="tel"
                          value={rsvpData.phone}
                          onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })}
                          placeholder="+57 300 000 0000"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f0ece4] placeholder-white/20 focus:border-[#c8a96e]/50 focus:bg-[#c8a96e]/5 outline-none transition-colors"
                        />
                      </div>
                    </>
                  )}

                  {guest && (
                    <div className="text-center py-4 bg-[#c8a96e]/10 rounded-xl mb-4">
                      <p className="text-[#c8a96e] font-medium">{guest.name}</p>
                      <p className="text-xs text-[#a09880]">Invitación personal</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] tracking-[2px] uppercase text-[#a09880] mb-2 font-medium">
                      ¿Cuántos acompañantes?
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={guest?.max_companions || 5}
                      value={rsvpData.companions}
                      onChange={(e) => setRsvpData({ ...rsvpData, companions: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f0ece4] focus:border-[#c8a96e]/50 focus:bg-[#c8a96e]/5 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[2px] uppercase text-[#a09880] mb-2 font-medium">
                      Mensaje para los novios (opcional)
                    </label>
                    <input
                      type="text"
                      value={rsvpData.message}
                      onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                      placeholder="¡Muchas felicidades! 🥂"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f0ece4] placeholder-white/20 focus:border-[#c8a96e]/50 focus:bg-[#c8a96e]/5 outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={() => handleRsvpSubmit("confirmed")}
                      disabled={submitting || (!guest && !rsvpData.name)}
                      className="py-4 rounded-xl bg-gradient-to-r from-[#c8a96e] to-[#b8944e] text-[#080810] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#c8a96e]/30 transition-all disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                      {submitting ? "Enviando..." : "Sí, voy"}
                    </button>
                    <button
                      onClick={() => handleRsvpSubmit("declined")}
                      disabled={submitting || (!guest && !rsvpData.name)}
                      className="py-4 rounded-xl border border-white/10 text-[#a09880] font-medium flex items-center justify-center gap-2 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      No podré
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl ${
                  rsvpStep === "confirmed" 
                    ? "bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30" 
                    : "bg-white/10 border border-white/20"
                }`}>
                  {rsvpStep === "confirmed" ? "🥂" : "💌"}
                </div>
                <h3 
                  className="text-2xl italic mb-2"
                  style={{ fontFamily: "Cormorant Garamond, serif" }}
                >
                  {rsvpStep === "confirmed" ? "¡Nos vemos pronto!" : "Lo entendemos"}
                </h3>
                <p className="text-sm text-[#a09880] max-w-xs mx-auto">
                  {rsvpStep === "confirmed" 
                    ? `Hemos confirmado ${1 + rsvpData.companions} lugar${rsvpData.companions > 0 ? "es" : ""}. ¡Los esperamos!`
                    : "Gracias por avisarnos. ¡Te echaremos de menos!"}
                </p>
                <button
                  onClick={shareWhatsApp}
                  className="mt-6 px-6 py-3 border border-[#c8a96e]/30 rounded-xl text-[#c8a96e] text-sm hover:bg-[#c8a96e]/10 transition-colors"
                >
                  Compartir invitación 📲
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Messages Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[9px] font-medium tracking-[5px] uppercase text-[#c8a96e]">Mensajes</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c8a96e]/30 to-transparent" />
          </div>

          <form onSubmit={handleSendMessage} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                placeholder="Tu nombre"
                value={newMessage.name}
                onChange={(e) => setNewMessage({ ...newMessage, name: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f0ece4] placeholder-white/20 focus:border-[#c8a96e]/50 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.name || !newMessage.content}
                className="bg-[#c8a96e] text-[#080810] rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </div>
            <textarea
              placeholder="Escribe tu mensaje..."
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f0ece4] placeholder-white/20 focus:border-[#c8a96e]/50 outline-none text-sm resize-none"
            />
          </form>

          <div className="space-y-3">
            {messages.map((message, i) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 rounded-xl p-4"
              >
                <p className="text-[#c8a96e] font-medium text-sm mb-1">{message.guest_name}</p>
                <p className="text-[#a09880] text-sm">{message.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Album Link */}
      <section className="py-20 px-6 relative z-10 bg-gradient-to-b from-transparent to-[#c8a96e]/10">
        <div className="max-w-lg mx-auto text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-[#c8a96e]" />
          <h2 
            className="text-3xl font-light italic mb-4"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Álbum de Fotos
          </h2>
          <p className="text-[#a09880] mb-8 max-w-sm mx-auto text-sm">
            Después del evento, comparte tus fotos con nosotros
          </p>
          <Link href={`/evento/${slug}/album`}>
            <Button className="bg-[#c8a96e] hover:bg-[#b8944e] text-[#080810]">
              <Camera className="w-5 h-5 mr-2" />
              Ir al álbum
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center relative z-10">
        <p 
          className="text-xl italic text-[#c8a96e] mb-2"
          style={{ fontFamily: "Cormorant Garamond, serif" }}
        >
          {event.bride_name} & {event.groom_name}
        </p>
        <p className="text-[11px] tracking-[3px] uppercase text-[#a09880] mb-6">
          {formatDate(event.date)}
        </p>
        <p className="text-xs text-white/20">
          ✦ Creado con Invyra
        </p>
      </footer>

      {/* WhatsApp FAB */}
      <motion.button
        initial={{ scale: 0, rotate: 45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 2.5, type: "spring" }}
        onClick={shareWhatsApp}
        className="fixed bottom-6 right-5 w-14 h-14 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-full flex items-center justify-center shadow-lg shadow-[#25d366]/30 hover:scale-110 transition-transform z-50"
        title="Compartir por WhatsApp"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.button>
    </div>
  );
}
