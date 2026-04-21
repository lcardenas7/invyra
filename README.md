# Invyra 💍

**Diseña, gestiona y revive tu evento en un solo lugar.**

Plataforma de invitaciones interactivas para bodas con editor visual, gestión de RSVP y álbum colaborativo.

## ✨ Características

- **Editor tipo Canva** - Personaliza invitaciones con drag & drop
- **6 Plantillas profesionales** - Diseños elegantes para bodas
- **Invitación interactiva** - Contador, mapa, historia de amor
- **Sistema RSVP** - Confirmaciones en tiempo real con confetti
- **Álbum colaborativo** - Los invitados suben fotos del evento
- **Dashboard** - Estadísticas y gestión de invitados

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Configurar base de datos

Ejecuta el SQL en `supabase/schema.sql` en el SQL Editor de Supabase.

### 4. Crear Storage Buckets en Supabase

- `event-photos` (público) - Para álbum colaborativo
- `user-uploads` (público) - Para imágenes del editor

### 5. Habilitar Auth con Google

En Supabase Dashboard → Authentication → Providers → Google

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🚂 Deploy en Railway

1. Conecta tu repositorio a Railway
2. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Railway detectará Next.js automáticamente

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── dashboard/             # Panel del anfitrión
│   │   ├── nuevo/             # Crear evento
│   │   ├── editor/[eventId]/  # Editor de invitación
│   │   └── evento/[eventId]/  # Gestión de invitados/álbum
│   └── evento/[slug]/         # Invitación pública
│       └── album/             # Álbum colaborativo
├── components/
│   ├── editor/                # Editor Fabric.js
│   └── ui/                    # Componentes shadcn/ui
├── data/
│   └── templates.ts           # Plantillas de invitaciones
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   └── utils.ts               # Utilidades
└── types/
    └── index.ts               # TypeScript types
```

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14, React, TailwindCSS
- **Editor:** Fabric.js
- **Animaciones:** Framer Motion
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **UI:** shadcn/ui, Lucide Icons

## 📝 Licencia

MIT
