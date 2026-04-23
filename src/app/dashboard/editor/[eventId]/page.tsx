"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Heart, ArrowLeft, Eye, Share2, Settings, Globe, GlobeLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase";
import { buildSuggestedWhatsAppMessage, getOpenInviteUrl } from "@/lib/share";
import { getTemplateById } from "@/data/templates";
import type { Event } from "@/types";

const CanvasEditor = dynamic(
  () => import("@/components/editor/CanvasEditor"),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div></div> }
);

const DEFAULT_CASH_ENVELOPE_NOTE =
  "Tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo, agradecemos lluvia de sobres.";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [formData, setFormData] = useState({
    name: "",
    bride_name: "",
    groom_name: "",
    date: "",
    time: "",
    location: "",
    location_url: "",
    story: "",
    dress_code: "",
    gift_type: "none" as "none" | "gift_registry" | "cash_envelope",
    gift_registry_url: "",
    gift_note: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: eventData, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .eq("user_id", user.id)
        .single();

      if (error || !eventData) {
        router.push("/dashboard");
        return;
      }

      setEvent(eventData);
      const hasGiftRegistry = Boolean(eventData.gift_registry?.trim());
      const hasCashEnvelope = Boolean(eventData.bank_info?.trim());
      const giftType = hasGiftRegistry
        ? "gift_registry"
        : hasCashEnvelope
        ? "cash_envelope"
        : "none";

      setFormData({
        name: eventData.name || "",
        bride_name: eventData.bride_name || "",
        groom_name: eventData.groom_name || "",
        date: eventData.date || "",
        time: eventData.time || "",
        location: eventData.location || "",
        location_url: eventData.location_url || "",
        story: eventData.story || "",
        dress_code: eventData.dress_code || "",
        gift_type: giftType,
        gift_registry_url: eventData.gift_registry || "",
        gift_note:
          eventData.bank_info ||
          (giftType === "cash_envelope" ? DEFAULT_CASH_ENVELOPE_NOTE : ""),
      });
      setLoading(false);
    };

    fetchEvent();
  }, [eventId, router]);

  const handleSaveCanvas = async (canvasData: string) => {
    if (!event) return;
    setSaving(true);
    
    const supabase = createClient();
    await supabase
      .from("events")
      .update({ canvas_data: canvasData, updated_at: new Date().toISOString() })
      .eq("id", event.id);
    
    setSaving(false);
  };

  const handleSaveDetails = async () => {
    if (!event) return;
    setSaving(true);

    const giftRegistry =
      formData.gift_type === "gift_registry" ? formData.gift_registry_url.trim() : "";
    const giftNote =
      formData.gift_type === "cash_envelope"
        ? formData.gift_note.trim() || DEFAULT_CASH_ENVELOPE_NOTE
        : "";

    if (formData.gift_type === "gift_registry" && !giftRegistry) {
      alert("Agrega el link de tu mesa de regalos.");
      setSaving(false);
      return;
    }

    const updatePayload = {
      name: formData.name,
      bride_name: formData.bride_name,
      groom_name: formData.groom_name,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      location_url: formData.location_url,
      story: formData.story,
      dress_code: formData.dress_code || null,
      gift_registry: giftRegistry || null,
      bank_info: giftNote || null,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", event.id);

    setEvent({
      ...event,
      ...updatePayload,
      gift_registry: giftRegistry || undefined,
      bank_info: giftNote || undefined,
    } as Event);
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!event) return;
    setSaving(true);
    
    const supabase = createClient();
    const newStatus = !event.is_published;
    
    await supabase
      .from("events")
      .update({ is_published: newStatus, updated_at: new Date().toISOString() })
      .eq("id", event.id);
    
    setEvent({ ...event, is_published: newStatus });
    setSaving(false);
  };

  const copyEventLink = () => {
    if (!event) return;
    const url = getOpenInviteUrl(event.slug, window.location.origin);
    navigator.clipboard.writeText(url);
    alert("Link de compartido copiado");
  };

  const copyWhatsAppMessage = () => {
    if (!event) return;
    const message = buildSuggestedWhatsAppMessage(event, window.location.origin);
    navigator.clipboard.writeText(message);
    alert("Mensaje sugerido para WhatsApp copiado");
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  const template = getTemplateById(event.template_id);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-[#D4AF37]" />
                <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                  {event.name}
                </span>
              </div>
              {saving && (
                <span className="text-sm text-gray-500">Guardando...</span>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Link href={`/evento/${event.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Vista previa
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyEventLink}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
              <Button
                size="sm"
                onClick={handlePublish}
                className={event.is_published 
                  ? "bg-gray-600 hover:bg-gray-700" 
                  : "bg-[#D4AF37] hover:bg-[#B8962E]"
                }
              >
                {event.is_published ? (
                  <>
                    <GlobeLock className="w-4 h-4 mr-2" />
                    Despublicar
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Publicar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden bg-white border-b px-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Detalles</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Config</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "editor" && (
          <CanvasEditor
            initialData={event.canvas_data || template?.canvas_data}
            onSave={handleSaveCanvas}
            templateColors={template?.colors}
          />
        )}

        {activeTab === "details" && (
          <div className="h-full overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalles del evento</h2>
              
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bride_name">Nombre de la novia</Label>
                    <Input
                      id="bride_name"
                      value={formData.bride_name}
                      onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groom_name">Nombre del novio</Label>
                    <Input
                      id="groom_name"
                      value={formData.groom_name}
                      onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nombre del evento</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora</Label>
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
                  <Label htmlFor="location">Lugar</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location_url">Link de Google Maps</Label>
                  <Input
                    id="location_url"
                    value={formData.location_url}
                    onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                    className="mt-1"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="story">Nuestra historia (opcional)</Label>
                  <Textarea
                    id="story"
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    className="mt-1"
                    rows={4}
                    placeholder="Cuéntale a tus invitados cómo se conocieron..."
                  />
                </div>

                <div>
                  <Label htmlFor="dress_code">Código de vestimenta (opcional)</Label>
                  <Input
                    id="dress_code"
                    value={formData.dress_code}
                    onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                    className="mt-1"
                    placeholder="Formal, Semi-formal, Casual elegante..."
                  />
                </div>

                <div>
                  <Label htmlFor="gift_type">Regalos (opcional)</Label>
                  <select
                    id="gift_type"
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    value={formData.gift_type}
                    onChange={(e) => {
                      const nextType = e.target.value as "none" | "gift_registry" | "cash_envelope";
                      setFormData((prev) => ({
                        ...prev,
                        gift_type: nextType,
                        gift_registry_url: nextType === "gift_registry" ? prev.gift_registry_url : "",
                        gift_note:
                          nextType === "cash_envelope"
                            ? prev.gift_note || DEFAULT_CASH_ENVELOPE_NOTE
                            : "",
                      }));
                    }}
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
                      value={formData.gift_registry_url}
                      onChange={(e) =>
                        setFormData({ ...formData, gift_registry_url: e.target.value })
                      }
                      className="mt-1"
                      placeholder="https://..."
                    />
                  </div>
                )}

                {formData.gift_type === "cash_envelope" && (
                  <div>
                    <Label htmlFor="gift_note">Mensaje de lluvia de sobres</Label>
                    <Textarea
                      id="gift_note"
                      value={formData.gift_note}
                      onChange={(e) => setFormData({ ...formData, gift_note: e.target.value })}
                      className="mt-1"
                      rows={3}
                      placeholder={DEFAULT_CASH_ENVELOPE_NOTE}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleSaveDetails}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8962E]"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="h-full overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>
              
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Estado de publicación</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {event.is_published 
                      ? "Tu invitación está publicada y visible para todos los que tengan el link."
                      : "Tu invitación está en modo borrador. Solo tú puedes verla."}
                  </p>
                  <Button
                    onClick={handlePublish}
                    className={event.is_published 
                      ? "bg-gray-600 hover:bg-gray-700" 
                      : "bg-[#D4AF37] hover:bg-[#B8962E]"
                    }
                  >
                    {event.is_published ? "Despublicar" : "Publicar invitación"}
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Link de compartido</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Este enlace abre primero la experiencia de WhatsApp y luego la invitacion completa.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={getOpenInviteUrl(event.slug, typeof window !== "undefined" ? window.location.origin : undefined)}
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={copyEventLink}>
                      Copiar
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" onClick={copyWhatsAppMessage} className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Copiar mensaje sugerido para WhatsApp
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Gestionar invitados</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ve las confirmaciones y gestiona tu lista de invitados.
                  </p>
                  <Link href={`/dashboard/evento/${event.id}/invitados`}>
                    <Button variant="outline">
                      Ver invitados
                    </Button>
                  </Link>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Álbum de fotos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Gestiona las fotos que suben tus invitados.
                  </p>
                  <Link href={`/dashboard/evento/${event.id}/album`}>
                    <Button variant="outline">
                      Ver álbum
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
