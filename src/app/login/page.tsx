"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const getOAuthRedirectTo = () => {
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const hasConfiguredSiteUrl =
      configuredSiteUrl && /^https?:\/\//i.test(configuredSiteUrl);
    const baseUrl = hasConfiguredSiteUrl
      ? configuredSiteUrl
      : window.location.origin;

    return new URL("/auth/callback", baseUrl).toString();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const supabase = createClient();
      const redirectTo = getOAuthRedirectTo();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) {
        throw new Error("No se pudo generar la URL de autenticacion.");
      }

      const oauthUrl = new URL(data.url);
      oauthUrl.searchParams.set("redirect_to", redirectTo);
      window.location.assign(oauthUrl.toString());
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });
        if (error) throw error;
        setError("Revisa tu email para confirmar tu cuenta");
      }
    } catch (err: any) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Heart className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8962E] bg-clip-text text-transparent">
              Invyra
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="text-gray-600 mb-8">
            {isLogin 
              ? "Inicia sesión para gestionar tus eventos" 
              : "Comienza a crear invitaciones increíbles"}
          </p>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 mb-6 text-base"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">o continúa con email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 mt-1"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className={`text-sm ${error.includes("Revisa") ? "text-green-600" : "text-red-600"}`}>
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#D4AF37] hover:bg-[#B8962E] text-white text-base"
              disabled={loading}
            >
              {loading ? "Cargando..." : isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-[#D4AF37] hover:text-[#B8962E] font-medium"
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Image/Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-50 to-rose-50 items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center animate-pulse-slow">
            <Heart className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Crea momentos inolvidables
          </h2>
          <p className="text-gray-600 text-lg">
            Diseña invitaciones únicas, gestiona tus invitados y guarda todos los recuerdos de tu evento especial.
          </p>
        </div>
      </div>
    </div>
  );
}
