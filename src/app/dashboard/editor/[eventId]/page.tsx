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
import { getTemplateById } from "@/data/templates";
import type { Event } from "@/types";

const CanvasEditor = dynamic(
  () => import("@/components/editor/CanvasEditor"),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div></div> }
);

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
    gift_registry: "",
    bank_info: "",
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
        gift_registry: eventData.gift_registry || "",
        bank_info: eventData.bank_info || "",
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
    
    const supabase = createClient();
    await supabase
      .from("events")
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq("id", event.id);
    
    setEvent({ ...event, ...formData });
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
    const url = `${window.location.origin}/evento/${event.slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado al portapapeles");
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
                  <Label htmlFor="gift_registry">Mesa de regalos (opcional)</Label>
                  <Input
                    id="gift_registry"
                    value={formData.gift_registry}
                    onChange={(e) => setFormData({ ...formData, gift_registry: e.target.value })}
                    className="mt-1"
                    placeholder="Link a tu mesa de regalos"
                  />
                </div>

                <div>
                  <Label htmlFor="bank_info">Información bancaria (opcional)</Label>
                  <Textarea
                    id="bank_info"
                    value={formData.bank_info}
                    onChange={(e) => setFormData({ ...formData, bank_info: e.target.value })}
                    className="mt-1"
                    rows={3}
                    placeholder="Banco, número de cuenta, titular..."
                  />
                </div>

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
                  <h3 className="font-semibold text-gray-900 mb-2">Link de tu invitación</h3>
                  <div className="flex gap-2">
                    <Input
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/evento/${event.slug}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={copyEventLink}>
                      Copiar
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
