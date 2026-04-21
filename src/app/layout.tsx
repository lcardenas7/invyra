import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invyra - Diseña, gestiona y revive tu evento",
  description: "Crea invitaciones interactivas, gestiona confirmaciones y guarda los recuerdos de tu evento en un solo lugar.",
  keywords: ["invitaciones", "bodas", "eventos", "RSVP", "álbum de fotos", "matrimonio"],
  openGraph: {
    title: "Invyra - Diseña, gestiona y revive tu evento",
    description: "Crea invitaciones interactivas, gestiona confirmaciones y guarda los recuerdos de tu evento en un solo lugar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Great+Vibes&family=Lato:wght@300;400;700&family=Cinzel:wght@400;500;600;700&family=Raleway:wght@300;400;500;600&family=Quicksand:wght@300;400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
