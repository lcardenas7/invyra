import Link from "next/link";
import { Heart, Sparkles, Users, Camera, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-[#D4AF37]" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8962E] bg-clip-text text-transparent">
                Invyra
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Características
              </Link>
              <Link href="#templates" className="text-gray-600 hover:text-gray-900 transition-colors">
                Plantillas
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                Cómo funciona
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar sesión</Button>
              </Link>
              <Link href="/login">
                <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-white">
                  Crear invitación
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Diseña, gestiona y revive tu evento
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up delay-100" style={{ fontFamily: 'Playfair Display, serif' }}>
            Invitaciones que <br />
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] bg-clip-text text-transparent">
              enamoran
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            Crea invitaciones interactivas para tu boda, gestiona confirmaciones en tiempo real 
            y guarda todos los recuerdos en un álbum colaborativo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link href="/login">
              <Button size="xl" className="bg-[#D4AF37] hover:bg-[#B8962E] text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                Comenzar gratis
              </Button>
            </Link>
            <Link href="/evento/demo">
              <Button size="xl" variant="outline" className="text-lg px-8 py-6 rounded-full border-2">
                Ver demo
              </Button>
            </Link>
          </div>

          {/* Preview Image */}
          <div className="mt-16 relative animate-fade-in-up delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-4xl mx-auto border border-gray-100">
              <div className="aspect-[16/10] bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Nuestra Boda</p>
                  <h3 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    María & Juan
                  </h3>
                  <p className="text-[#D4AF37] text-lg">15 de Junio, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Todo lo que necesitas para tu evento
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde el diseño hasta los recuerdos, todo en un solo lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Editor tipo Canva",
                description: "Personaliza cada detalle de tu invitación con nuestro editor visual intuitivo. Arrastra, suelta y crea.",
                color: "bg-purple-100 text-purple-600"
              },
              {
                icon: Calendar,
                title: "Invitación interactiva",
                description: "Contador regresivo, mapa interactivo, historia de amor y más. Una experiencia única para tus invitados.",
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: Users,
                title: "Gestión de invitados",
                description: "Controla confirmaciones en tiempo real. Sabe quién asiste, quién no y cuántos acompañantes traen.",
                color: "bg-green-100 text-green-600"
              },
              {
                icon: Share2,
                title: "Comparte fácilmente",
                description: "Un link único para compartir por WhatsApp, email o redes sociales. Sin apps, sin descargas.",
                color: "bg-amber-100 text-amber-600"
              },
              {
                icon: Camera,
                title: "Álbum colaborativo",
                description: "Tus invitados suben fotos del evento. Todos los recuerdos en un solo lugar.",
                color: "bg-rose-100 text-rose-600"
              },
              {
                icon: Heart,
                title: "Mensajes de amor",
                description: "Recibe buenos deseos de tus invitados. Un muro de mensajes para recordar siempre.",
                color: "bg-pink-100 text-pink-600"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-20 px-4 bg-gradient-to-b from-white to-amber-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Plantillas profesionales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diseños elegantes listos para personalizar. Elige tu estilo favorito.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Elegante Clásica", bg: "from-amber-100 to-amber-50", accent: "#D4AF37" },
              { name: "Minimalista", bg: "from-gray-100 to-white", accent: "#000000" },
              { name: "Romántica Floral", bg: "from-rose-100 to-pink-50", accent: "#E8B4B8" },
              { name: "Rústica Bohemia", bg: "from-orange-100 to-amber-50", accent: "#C4A484" },
              { name: "Tropical", bg: "from-emerald-100 to-green-50", accent: "#1B4D3E" },
              { name: "Art Deco", bg: "from-gray-900 to-gray-800", accent: "#D4AF37" }
            ].map((template, index) => (
              <div 
                key={index}
                className="group cursor-pointer"
              >
                <div className={`aspect-[3/4] rounded-xl bg-gradient-to-b ${template.bg} p-4 flex flex-col items-center justify-center border border-gray-200 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                  <div 
                    className="w-8 h-8 rounded-full mb-3"
                    style={{ backgroundColor: template.accent }}
                  />
                  <div className="w-16 h-1 rounded mb-2" style={{ backgroundColor: template.accent, opacity: 0.5 }} />
                  <div className="w-12 h-1 rounded" style={{ backgroundColor: template.accent, opacity: 0.3 }} />
                </div>
                <p className="text-sm text-center mt-2 text-gray-600 group-hover:text-gray-900 transition-colors">
                  {template.name}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/login">
              <Button size="lg" className="bg-[#D4AF37] hover:bg-[#B8962E] text-white">
                Ver todas las plantillas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Así de fácil
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En 3 simples pasos tendrás tu invitación lista para compartir.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Elige una plantilla",
                description: "Selecciona el diseño que más te guste de nuestra colección de plantillas profesionales."
              },
              {
                step: "2",
                title: "Personaliza tu invitación",
                description: "Edita textos, colores, imágenes y agrega los detalles de tu evento con nuestro editor visual."
              },
              {
                step: "3",
                title: "Comparte y gestiona",
                description: "Obtén tu link único, compártelo y gestiona las confirmaciones en tiempo real."
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#D4AF37] to-[#B8962E]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            ¿Listo para crear tu invitación?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Comienza gratis y sorprende a tus invitados con una experiencia única.
          </p>
          <Link href="/login">
            <Button size="xl" className="bg-white text-[#D4AF37] hover:bg-gray-100 text-lg px-10 py-6 rounded-full shadow-lg">
              Comenzar ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-xl font-bold">Invyra</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Invyra. Diseña, gestiona y revive tu evento.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Términos
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacidad
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
