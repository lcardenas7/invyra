-- =============================================
-- INVYRA - Schema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: profiles (usuarios/anfitriones)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TABLA: events (eventos/invitaciones)
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  event_type TEXT DEFAULT 'wedding' CHECK (event_type IN ('wedding', 'birthday', 'baby_shower', 'graduation', 'corporate', 'other')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  location_url TEXT,
  template_id TEXT NOT NULL,
  canvas_data JSONB,
  cover_image TEXT,
  
  -- Campos específicos de boda
  bride_name TEXT,
  groom_name TEXT,
  story TEXT,
  
  -- Configuración adicional
  dress_code TEXT,
  gift_registry TEXT,
  bank_info TEXT,
  music_url TEXT,
  
  -- Estado
  is_published BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- =============================================
-- TABLA: guests (invitados)
-- =============================================
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  companions INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);

-- =============================================
-- TABLA: photos (álbum colaborativo)
-- =============================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);

-- =============================================
-- TABLA: messages (mensajes de buenos deseos)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_event_id ON messages(event_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para events
CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published events by slug" ON events
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para guests
CREATE POLICY "Event owners can view guests" ON guests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = guests.event_id AND events.user_id = auth.uid())
  );

CREATE POLICY "Anyone can create guest (RSVP)" ON guests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = guests.event_id AND events.is_published = TRUE)
  );

CREATE POLICY "Event owners can update guests" ON guests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = guests.event_id AND events.user_id = auth.uid())
  );

CREATE POLICY "Event owners can delete guests" ON guests
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = guests.event_id AND events.user_id = auth.uid())
  );

-- Políticas para photos
CREATE POLICY "Anyone can view approved photos of published events" ON photos
  FOR SELECT USING (
    is_approved = TRUE AND
    EXISTS (SELECT 1 FROM events WHERE events.id = photos.event_id AND events.is_published = TRUE)
  );

CREATE POLICY "Event owners can view all photos" ON photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = photos.event_id AND events.user_id = auth.uid())
  );

CREATE POLICY "Anyone can upload photos to published events" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = photos.event_id AND events.is_published = TRUE)
  );

CREATE POLICY "Event owners can update photos" ON photos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = photos.event_id AND events.user_id = auth.uid())
  );

CREATE POLICY "Event owners can delete photos" ON photos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = photos.event_id AND events.user_id = auth.uid())
  );

-- Políticas para messages
CREATE POLICY "Anyone can view messages of published events" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = messages.event_id AND events.is_published = TRUE)
  );

CREATE POLICY "Anyone can create messages for published events" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = messages.event_id AND events.is_published = TRUE)
  );

CREATE POLICY "Event owners can delete messages" ON messages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = messages.event_id AND events.user_id = auth.uid())
  );

-- =============================================
-- STORAGE BUCKETS
-- Crear estos buckets manualmente en Supabase Dashboard:
-- 1. event-covers - para imágenes de portada
-- 2. event-photos - para álbum colaborativo
-- 3. user-uploads - para imágenes subidas en el editor
-- =============================================

-- Nota: Los buckets se crean desde el Dashboard de Supabase
-- Storage → New Bucket → Nombre: event-photos → Public: ON
