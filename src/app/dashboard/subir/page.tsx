"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Heart, ArrowLeft, Upload, ImageIcon, Check, 
  MapPin, Calendar, Clock, Users, Camera, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";

export default function SubirInvitacionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    bride_name: "",
    groom_name: "",
    event_type: "wedding",
    date: "",
    time: "",
    location: "",
    location_url: "",
    dress_code: "",
    gift_type: "none",
    gift_registry_url: "",
    gift_note: "",
    message: "",
  });

  const COVER_UPLOAD_BUCKETS = ["event-covers", "event-photos", "user-uploads"] as const;
  const DEFAULT_TEMPLATE_BY_EVENT_TYPE = {
    wedding: "wedding-gold-classic",
    birthday: "birthday-golden",
    baby_shower: "baby-blue-clouds",
    graduation: "grad-classic-blue",
    corporate: "corp-professional",
    other: "wedding-gold-classic",
  } as const;

  const formatErrorMessage = (error: unknown, fallback: string) => {
    if (!error || typeof error !== "object") return fallback;
    const maybeError = error as { message?: string; details?: string; hint?: string };
    const parts = [maybeError.message, maybeError.details, maybeError.hint].filter(Boolean);
    return parts.length > 0 ? parts.join(" | ") : fallback;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!uploadedImage) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      let coverUrl = "";

      // Upload image to Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const uploadErrors: string[] = [];

        for (const bucket of COVER_UPLOAD_BUCKETS) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, imageFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: imageFile.type,
            });

          if (uploadError) {
            uploadErrors.push(`${bucket}: ${uploadError.message}`);
            continue;
          }

          if (uploadData?.path) {
            const { data: publicUrl } = supabase.storage
              .from(bucket)
              .getPublicUrl(uploadData.path);
            coverUrl = publicUrl.publicUrl;
            break;
          }
        }

        if (!coverUrl) {
          throw new Error(
            `No se pudo subir la imagen de portada. Revisa buckets/politicas de Storage. ${uploadErrors.join(
              " | "
            )}`
          );
        }
      }

      const eventName = formData.name || `${formData.bride_name} & ${formData.groom_name}`;
      const slug = generateSlug(eventName);
      const templateId =
        DEFAULT_TEMPLATE_BY_EVENT_TYPE[
          formData.event_type as keyof typeof DEFAULT_TEMPLATE_BY_EVENT_TYPE
        ] ?? DEFAULT_TEMPLATE_BY_EVENT_TYPE.wedding;
      const giftRegistry =
        formData.gift_type === "gift_registry" ? formData.gift_registry_url.trim() : "";
      const giftNote =
        formData.gift_type === "cash_envelope" ? formData.gift_note.trim() : "";

      if (formData.gift_type === "gift_registry" && !giftRegistry) {
        throw new Error("Agrega el link de tu mesa de regalos.");
      }

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          name: eventName,
          slug,
          event_type: formData.event_type,
          template_id: templateId,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          location_url: formData.location_url,
          cover_image: coverUrl,
          bride_name: formData.bride_name,
          groom_name: formData.groom_name,
          dress_code: formData.dress_code || null,
          gift_registry: giftRegistry || null,
          bank_info: giftNote || null,
          is_published: true,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/evento/${event.slug}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert(formatErrorMessage(error, "Error al crear el evento. Intenta de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Upload className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8962E] bg-clip-text text-transparent">
                  Subir mi invitación
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? "bg-[#D4AF37] text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-1 mx-2 rounded ${step > s ? "bg-[#D4AF37]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Step 1: Upload Image */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                Sube tu invitación
              </h1>
              <p className="text-gray-600">
                Sube la imagen de tu invitación y nosotros la hacemos interactiva
              </p>
            </div>

            <Card className="p-8">
              {!uploadedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-[#D4AF37] hover:bg-amber-50/30 transition-all"
                >
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Arrastra tu imagen aquí o haz clic para seleccionar
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    JPG, PNG o WebP — Máximo 10MB
                  </p>
                  <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar imagen
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative max-w-sm mx-auto rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={uploadedImage}
                      alt="Invitación subida"
                      className="w-full h-auto"
                    />
                    <button
                      onClick={() => { setUploadedImage(null); setImageFile(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-center text-sm text-green-600 font-medium">
                    ✓ Imagen cargada correctamente
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </Card>

            <div className="flex justify-end mt-8">
              <Button
                onClick={() => setStep(2)}
                disabled={!uploadedImage}
                className="bg-[#D4AF37] hover:bg-[#B8962E] text-white px-8"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Event Details */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                Datos del evento
              </h1>
              <p className="text-gray-600">
                Esta información se usará para los elementos interactivos
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label>Tipo de evento</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  >
                    <option value="wedding">💍 Boda</option>
                    <option value="birthday">🎂 Cumpleaños</option>
                    <option value="baby_shower">👶 Baby Shower</option>
                    <option value="graduation">🎓 Graduación</option>
                    <option value="corporate">🏢 Corporativo</option>
                    <option value="other">📋 Otro</option>
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bride_name">
                      {formData.event_type === "wedding" ? "Nombre de la novia" : "Nombre del anfitrión"}
                    </Label>
                    <Input
                      id="bride_name"
                      placeholder={formData.event_type === "wedding" ? "Margarita" : "Nombre"}
                      value={formData.bride_name}
                      onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groom_name">
                      {formData.event_type === "wedding" ? "Nombre del novio" : "Nombre del co-anfitrión (opcional)"}
                    </Label>
                    <Input
                      id="groom_name"
                      placeholder={formData.event_type === "wedding" ? "Fernando" : "Nombre"}
                      value={formData.groom_name}
                      onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nombre del evento (opcional)</Label>
                  <Input
                    id="name"
                    placeholder="Boda de Margarita & Fernando"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Fecha del evento
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Hora del evento
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Lugar del evento
                  </Label>
                  <Input
                    id="location"
                    placeholder="Hacienda Los Robles, Ciudad"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location_url">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Link de Google Maps (opcional)
                  </Label>
                  <Input
                    id="location_url"
                    placeholder="https://maps.google.com/..."
                    value={formData.location_url}
                    onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dress_code">
                    <Users className="w-4 h-4 inline mr-1" />
                    Código de vestimenta (opcional)
                  </Label>
                  <Input
                    id="dress_code"
                    placeholder="Formal, Casual elegante, Blanco total..."
                    value={formData.dress_code}
                    onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="gift_type">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Regalos (opcional)
                  </Label>
                  <select
                    id="gift_type"
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    value={formData.gift_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gift_type: e.target.value,
                        gift_registry_url: "",
                        gift_note: "",
                      })
                    }
                  >
                    <option value="none">Sin indicación especial</option>
                    <option value="gift_registry">Mesa de regalos (link)</option>
                    <option value="cash_envelope">Lluvia de sobres</option>
                  </select>
                </div>

                {formData.gift_type === "gift_registry" && (
                  <div>
                    <Label htmlFor="gift_registry_url">Link de mesa de regalos</Label>
                    <Input
                      id="gift_registry_url"
                      placeholder="https://..."
                      value={formData.gift_registry_url}
                      onChange={(e) =>
                        setFormData({ ...formData, gift_registry_url: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                )}

                {formData.gift_type === "cash_envelope" && (
                  <div>
                    <Label htmlFor="gift_note">Mensaje de lluvia de sobres</Label>
                    <textarea
                      id="gift_note"
                      placeholder="Tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo, agradecemos lluvia de sobres."
                      value={formData.gift_note}
                      onChange={(e) => setFormData({ ...formData, gift_note: e.target.value })}
                      className="w-full mt-1 p-2 border rounded-md text-sm min-h-[80px] resize-none"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Mensaje especial (opcional)</Label>
                  <textarea
                    id="message"
                    placeholder="Este día especial queremos compartirlo con nuestros seres queridos..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-md text-sm min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.bride_name || !formData.date || !formData.time || !formData.location}
                  className="bg-[#D4AF37] hover:bg-[#B8962E] text-white px-8"
                >
                  Continuar
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Preview & Confirm */}
        {step === 3 && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                Vista previa
              </h1>
              <p className="text-gray-600">
                Así se verá tu invitación interactiva
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Image Preview */}
              <div>
                <Card className="overflow-hidden">
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Invitación"
                      className="w-full h-auto"
                    />
                  )}
                </Card>
              </div>

              {/* Right: Interactive Elements Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Elementos interactivos que se agregarán:
                </h3>

                <Card className="p-4 border-l-4 border-l-[#D4AF37]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Contador regresivo</p>
                      <p className="text-xs text-gray-500">Cuenta atrás en tiempo real hasta el evento</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-green-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Mapa interactivo</p>
                      <p className="text-xs text-gray-500">{formData.location}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Confirmar asistencia (RSVP)</p>
                      <p className="text-xs text-gray-500">Formulario con confetti de celebración</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-purple-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Mensajes de los invitados</p>
                      <p className="text-xs text-gray-500">Los invitados pueden dejar deseos y mensajes</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-pink-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Álbum colaborativo</p>
                      <p className="text-xs text-gray-500">Los invitados suben fotos del evento</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Animaciones y efectos</p>
                      <p className="text-xs text-gray-500">Parallax, fade-in y transiciones suaves</p>
                    </div>
                  </div>
                </Card>

                {formData.dress_code && (
                  <Card className="p-4 border-l-4 border-l-violet-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Código de vestimenta</p>
                        <p className="text-xs text-gray-500">{formData.dress_code}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {formData.gift_type !== "none" && (
                  <Card className="p-4 border-l-4 border-l-[#D4AF37]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Regalos</p>
                        <p className="text-xs text-gray-500">
                          {formData.gift_type === "gift_registry"
                            ? "Mesa de regalos con link"
                            : "Lluvia de sobres"}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="bg-[#D4AF37] hover:bg-[#B8962E] text-white px-8"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creando invitación...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Crear invitación interactiva
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
