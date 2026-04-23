"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Camera, Upload, X, ArrowLeft, 
  Download, Trash2, ZoomIn, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { combineDateAndTime, formatDate, formatTime } from "@/lib/utils";
import type { Event, Photo } from "@/types";

type StoredGuestProfile = {
  name?: string;
  email?: string;
  phone?: string;
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

export default function AlbumPage() {
  const params = useParams();
  const slug = params.slug as string;
  const guestProfileStorageKey = `invyra:guest-profile:${slug}`;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
  const [storedGuestProfile] = useState(() => getStoredGuestProfile(guestProfileStorageKey));
  const [guestName, setGuestName] = useState(storedGuestProfile.name ?? "");
  const [guestEmail, setGuestEmail] = useState(storedGuestProfile.email ?? "");
  const [guestPhone, setGuestPhone] = useState(storedGuestProfile.phone ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Demo mode
      if (slug === "demo") {
        setEvent({
          id: "demo",
          user_id: "demo",
          name: "María & Juan",
          slug: "demo",
          event_type: "wedding",
          date: new Date().toISOString().split("T")[0],
          time: "17:00",
          location: "Hacienda Los Robles",
          template_id: "wedding-elegant-classic",
          bride_name: "María",
          groom_name: "Juan",
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Event);
        
        // Demo photos
        setPhotos([
          { id: "1", event_id: "demo", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", guest_name: "Ana García", is_approved: true, created_at: new Date().toISOString() },
          { id: "2", event_id: "demo", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800", guest_name: "Carlos López", is_approved: true, created_at: new Date().toISOString() },
          { id: "3", event_id: "demo", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800", guest_name: "María Pérez", is_approved: true, created_at: new Date().toISOString() },
          { id: "4", event_id: "demo", url: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800", guest_name: "Juan Rodríguez", is_approved: true, created_at: new Date().toISOString() },
          { id: "5", event_id: "demo", url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800", guest_name: "Laura Martínez", is_approved: true, created_at: new Date().toISOString() },
          { id: "6", event_id: "demo", url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800", guest_name: "Pedro Sánchez", is_approved: true, created_at: new Date().toISOString() },
        ]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      // Fetch event
      const { data: eventData, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error || !eventData) {
        setLoading(false);
        return;
      }

      setEvent(eventData);

      // Fetch photos
      const { data: photosData } = await supabase
        .from("photos")
        .select("*")
        .eq("event_id", eventData.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (photosData) {
        setPhotos(photosData);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !event || !guestName.trim()) {
      alert("Por favor ingresa tu nombre antes de subir fotos");
      return;
    }

    const albumOpenAt = combineDateAndTime(event.date, event.time);
    if (Date.now() < albumOpenAt.getTime()) {
      alert(
        `El album se habilita el ${formatDate(event.date)} a las ${formatTime(albumOpenAt)}.`
      );
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        guestProfileStorageKey,
        JSON.stringify({
          name: guestName.trim(),
          email: guestEmail.trim(),
          phone: guestPhone.trim(),
        })
      );
    }

    setUploading(true);
    const uploadErrors: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;

      if (slug === "demo") {
        // Demo mode - just add to local state
        const url = URL.createObjectURL(file);
        setPhotos(prev => [{
          id: Date.now().toString(),
          event_id: "demo",
          url,
          guest_name: guestName,
          is_approved: true,
          created_at: new Date().toISOString(),
        }, ...prev]);
        continue;
      }

      try {
        const supabase = createClient();
        const fileName = `${event.id}/${Date.now()}-${file.name}`;
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("event-photos")
          .getPublicUrl(fileName);

        // Save to database
        const { data: photoData, error: dbError } = await supabase
          .from("photos")
          .insert({
            event_id: event.id,
            url: publicUrl,
            guest_name: guestName,
            is_approved: true,
          })
          .select()
          .single();

        if (!dbError && photoData) {
          setPhotos(prev => [photoData, ...prev]);
        }
      } catch (error) {
        console.error("Error uploading photo:", error);
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message?: string }).message)
            : "Error desconocido";
        uploadErrors.push(`${file.name}: ${message}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (uploadErrors.length > 0) {
      const hasRlsError = uploadErrors.some((item) =>
        item.toLowerCase().includes("row-level security policy")
      );

      if (hasRlsError) {
        alert(
          "No se pudieron subir algunas fotos porque la politica de Storage del bucket 'event-photos' esta bloqueando INSERT para invitados. Revisa políticas RLS de Storage."
        );
      } else {
        alert(`No se pudieron subir ${uploadErrors.length} foto(s). Intenta de nuevo.`);
      }
    }
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const newIndex = direction === "prev" 
      ? (currentIndex - 1 + photos.length) % photos.length
      : (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[newIndex]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <div className="text-center">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Álbum no encontrado</h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const albumOpenAt = combineDateAndTime(event.date, event.time);
  const canUploadPhotos = nowTimestamp >= albumOpenAt.getTime();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/evento/${slug}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-gray-900">Álbum de Fotos</h1>
                <p className="text-sm text-gray-500">{event.bride_name} & {event.groom_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <Camera className="w-8 h-8 text-[#D4AF37]" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Comparte tus fotos</h2>
              <p className="text-gray-600 text-sm">Sube las fotos del evento para que todos las vean</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Input
                placeholder="Tu nombre"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Tu WhatsApp (opcional)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Tu email (opcional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
                disabled={!canUploadPhotos || uploading || !guestName.trim()}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !guestName.trim() || !canUploadPhotos}
                className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-white"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {canUploadPhotos ? "Subir fotos" : "Album bloqueado"}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {!canUploadPhotos && (
            <p className="text-sm text-amber-700 mb-2">
              El album se habilita el {formatDate(event.date)} a las {formatTime(albumOpenAt)}.
            </p>
          )}
          {!guestName.trim() && (
            <p className="text-sm text-amber-600">Ingresa tu nombre para poder subir fotos</p>
          )}
          {guestName.trim() && (
            <p className="text-sm text-gray-500">
              Guardaremos estos datos en este dispositivo para no pedirlos de nuevo.
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Por ahora solo se admiten imagenes (JPG, PNG, WEBP). Videos aun no estan habilitados.
          </p>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aún no hay fotos
            </h3>
            <p className="text-gray-600">
              ¡Sé el primero en compartir una foto del evento!
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">{photos.length} fotos compartidas</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={`Foto de ${photo.guest_name}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-sm truncate">{photo.guest_name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("prev");
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("next");
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-5xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={`Foto de ${selectedPhoto.guest_name}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="text-center mt-4">
                <p className="text-white">{selectedPhoto.guest_name}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
