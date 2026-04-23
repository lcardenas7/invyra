"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Heart, Plus, Calendar, Users, Image as ImageIcon, 
  MoreVertical, Eye, Edit, Trash2, Share2, LogOut,
  CheckCircle, Clock, XCircle, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import type { Event } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }
      
      setUser(user);
      
      // Fetch user's events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (eventsData) {
        setEvents(eventsData);
      }
      
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", eventId);
    setEvents(events.filter(e => e.id !== eventId));
  };

  const copyEventLink = (slug: string) => {
    const url = `${window.location.origin}/evento/${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado al portapapeles");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-[#D4AF37]" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8962E] bg-clip-text text-transparent">
                Invyra
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center text-white font-medium">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-700 hidden sm:block">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hola, {user?.user_metadata?.full_name?.split(" ")[0] || "Usuario"} 👋
            </h1>
            <p className="text-gray-600">Gestiona tus eventos e invitaciones</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/subir">
              <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-amber-50">
                <Upload className="w-5 h-5 mr-2" />
                Subir mi invitación
              </Button>
            </Link>
            <Link href="/dashboard/nuevo">
              <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-white">
                <Plus className="w-5 h-5 mr-2" />
                Crear con plantilla
              </Button>
            </Link>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes eventos aún
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Crea tu primer evento y diseña una invitación increíble para compartir con tus invitados.
            </p>
            <Link href="/dashboard/nuevo">
              <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-white">
                <Plus className="w-5 h-5 mr-2" />
                Crear mi primer evento
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Event Cover */}
                <div className="aspect-[16/9] bg-gradient-to-br from-amber-100 to-rose-100 relative">
                  {event.cover_image ? (
                    <img 
                      src={event.cover_image} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-[#D4AF37]/50" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                    event.is_published 
                      ? "bg-green-100 text-green-700" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {event.is_published ? "Publicado" : "Borrador"}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(`${event.date}T12:00:00`).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>0</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>0</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600">
                      <Clock className="w-4 h-4" />
                      <span>0</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/evento/${event.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/dashboard/editor/${event.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyEventLink(event.slug)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
