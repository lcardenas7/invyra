"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Heart, ArrowLeft, Camera, Trash2, Check, X, 
  Download, ZoomIn, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import type { Event, Photo } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAlbumPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .eq("user_id", user.id)
        .single();

      if (eventError || !eventData) {
        router.push("/dashboard");
        return;
      }

      setEvent(eventData);

      // Fetch ALL photos (including unapproved)
      const { data: photosData } = await supabase
        .from("photos")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (photosData) {
        setPhotos(photosData);
      }

      setLoading(false);
    };

    fetchData();
  }, [eventId, router]);

  const handleApprovePhoto = async (photoId: string, approved: boolean) => {
    const supabase = createClient();
    await supabase
      .from("photos")
      .update({ is_approved: approved })
      .eq("id", photoId);

    setPhotos(photos.map(p => 
      p.id === photoId ? { ...p, is_approved: approved } : p
    ));
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("¿Eliminar esta foto?")) return;

    const supabase = createClient();
    const photo = photos.find(p => p.id === photoId);
    
    if (photo) {
      // Delete from storage
      const fileName = photo.url.split("/").pop();
      if (fileName) {
        await supabase.storage
          .from("event-photos")
          .remove([`${eventId}/${fileName}`]);
      }
    }

    await supabase.from("photos").delete().eq("id", photoId);
    setPhotos(photos.filter(p => p.id !== photoId));
    
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
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

  const stats = {
    total: photos.length,
    approved: photos.filter(p => p.is_approved).length,
    pending: photos.filter(p => !p.is_approved).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/editor/${eventId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-gray-900">Álbum de Fotos</h1>
                <p className="text-sm text-gray-500">{event.name}</p>
              </div>
            </div>
            <Link href={`/evento/${event.slug}/album`} target="_blank">
              <Button variant="outline">
                Ver álbum público
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-gray-500">Aprobadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <X className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <Card className="p-12 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aún no hay fotos
            </h3>
            <p className="text-gray-600">
              Cuando los invitados suban fotos, aparecerán aquí.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-100 ${
                  !photo.is_approved ? "ring-2 ring-amber-400" : ""
                }`}
              >
                <img
                  src={photo.url}
                  alt={`Foto de ${photo.guest_name}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`w-8 h-8 ${photo.is_approved ? "bg-green-100" : ""}`}
                      onClick={() => handleApprovePhoto(photo.id, !photo.is_approved)}
                    >
                      <Check className={`w-4 h-4 ${photo.is_approved ? "text-green-600" : ""}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 hover:bg-red-100"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Status badge */}
                {!photo.is_approved && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    Pendiente
                  </div>
                )}

                {/* Guest name */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-sm truncate">{photo.guest_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-white">{selectedPhoto.guest_name}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedPhoto.is_approved ? "default" : "outline"}
                    className={selectedPhoto.is_approved ? "bg-green-600" : "text-white border-white"}
                    onClick={() => handleApprovePhoto(selectedPhoto.id, !selectedPhoto.is_approved)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {selectedPhoto.is_approved ? "Aprobada" : "Aprobar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-400 hover:bg-red-500/20"
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
