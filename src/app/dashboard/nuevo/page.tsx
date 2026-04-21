"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, Check, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { allTemplates, categories, getPopularTemplates } from "@/data/templates";
import { createClient } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";
import type { Template } from "@/types";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    bride_name: "",
    groom_name: "",
    date: "",
    time: "",
    location: "",
    location_url: "",
  });

  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;
    if (selectedCategory === "popular") {
      templates = getPopularTemplates();
    } else if (selectedCategory !== "all") {
      templates = templates.filter(t => t.category === selectedCategory);
    }
    if (searchTerm) {
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return templates;
  }, [selectedCategory, searchTerm]);

  const handleCreateEvent = async () => {
    if (!selectedTemplate) return;
    
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const eventName = formData.name || `${formData.bride_name} & ${formData.groom_name}`;
      const slug = generateSlug(eventName);

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          name: eventName,
          slug,
          event_type: "wedding",
          date: formData.date,
          time: formData.time,
          location: formData.location,
          location_url: formData.location_url,
          template_id: selectedTemplate.id,
          canvas_data: selectedTemplate.canvas_data,
          bride_name: formData.bride_name,
          groom_name: formData.groom_name,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/dashboard/editor/${event.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error al crear el evento. Intenta de nuevo.");
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
                <Heart className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8962E] bg-clip-text text-transparent">
                  Nuevo Evento
                </span>
              </div>
            </div>
            
            {/* Steps indicator */}
            <div className="hidden sm:flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s 
                      ? "bg-[#D4AF37] text-white" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 2 && (
                    <div className={`w-12 h-1 mx-2 rounded ${
                      step > s ? "bg-[#D4AF37]" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: Select Template */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Elige tu plantilla
              </h1>
              <p className="text-gray-600">
                Más de {allTemplates.length} diseños profesionales para tu evento
              </p>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 space-y-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar plantillas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-[#D4AF37] hover:bg-[#B8962E]" : ""}
                >
                  Todas ({allTemplates.length})
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "popular" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("popular")}
                  className={selectedCategory === "popular" ? "bg-[#D4AF37] hover:bg-[#B8962E]" : ""}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Populares
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? "bg-[#D4AF37] hover:bg-[#B8962E]" : ""}
                  >
                    {cat.icon} {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">
              {filteredTemplates.length} plantillas encontradas
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                    selectedTemplate?.id === template.id 
                      ? "ring-2 ring-[#D4AF37] shadow-lg" 
                      : ""
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div 
                    className="aspect-[3/4] p-4 flex flex-col items-center justify-center relative"
                    style={{ backgroundColor: template.colors.background }}
                  >
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <p 
                      className="text-[10px] mb-2 opacity-70"
                      style={{ color: template.colors.primary, fontFamily: template.fonts.body }}
                    >
                      Celebremos
                    </p>
                    <h3 
                      className="text-lg mb-0.5 text-center leading-tight"
                      style={{ color: template.colors.text, fontFamily: template.fonts.heading }}
                    >
                      María
                    </h3>
                    <span 
                      className="text-base mb-0.5"
                      style={{ color: template.colors.primary, fontFamily: template.fonts.heading }}
                    >
                      &
                    </span>
                    <h3 
                      className="text-lg mb-2 text-center leading-tight"
                      style={{ color: template.colors.text, fontFamily: template.fonts.heading }}
                    >
                      Juan
                    </h3>
                    <div 
                      className="w-10 h-px mb-2"
                      style={{ backgroundColor: template.colors.primary }}
                    />
                    <p 
                      className="text-[10px]"
                      style={{ color: template.colors.text, fontFamily: template.fonts.body }}
                    >
                      15 de Junio, 2025
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white border-t">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{template.name}</h4>
                    <div className="flex gap-1 mt-1.5">
                      {Object.values(template.colors).slice(0, 4).map((color, i) => (
                        <div 
                          key={i}
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color as string }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron plantillas con ese criterio</p>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedTemplate}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Detalles del evento
              </h1>
              <p className="text-gray-600">
                Completa la información de tu boda
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bride_name">Nombre de la novia</Label>
                    <Input
                      id="bride_name"
                      placeholder="María"
                      value={formData.bride_name}
                      onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="groom_name">Nombre del novio</Label>
                    <Input
                      id="groom_name"
                      placeholder="Juan"
                      value={formData.groom_name}
                      onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nombre del evento (opcional)</Label>
                  <Input
                    id="name"
                    placeholder="Boda de María & Juan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si lo dejas vacío, usaremos los nombres de los novios
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Fecha del evento</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora del evento</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Lugar del evento</Label>
                  <Input
                    id="location"
                    placeholder="Hacienda Los Robles, Ciudad"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location_url">Link de Google Maps (opcional)</Label>
                  <Input
                    id="location_url"
                    placeholder="https://maps.google.com/..."
                    value={formData.location_url}
                    onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  disabled={loading || !formData.bride_name || !formData.groom_name || !formData.date || !formData.time || !formData.location}
                  className="bg-[#D4AF37] hover:bg-[#B8962E] text-white px-8"
                >
                  {loading ? "Creando..." : "Crear y editar invitación"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
