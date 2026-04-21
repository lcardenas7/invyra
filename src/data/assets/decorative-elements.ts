// ============================================
// LIBRERÍA DE ELEMENTOS DECORATIVOS SVG
// Elementos gratuitos para invitaciones
// ============================================

export interface DecorativeElement {
  id: string
  name: string
  category: 'flowers' | 'frames' | 'ornaments' | 'dividers' | 'corners' | 'icons' | 'backgrounds'
  svg: string
  width: number
  height: number
  tags: string[]
}

// ── FLORES ──
const flowers: DecorativeElement[] = [
  {
    id: 'flower-rose-blue-1',
    name: 'Rosa Azul',
    category: 'flowers',
    width: 120,
    height: 120,
    tags: ['azul', 'rosa', 'elegante'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g opacity="0.95"><circle cx="60" cy="50" r="18" fill="#7BA7CC"/><circle cx="48" cy="42" r="16" fill="#8BB5D6"/><circle cx="72" cy="42" r="16" fill="#8BB5D6"/><circle cx="52" cy="58" r="15" fill="#6A9AC0"/><circle cx="68" cy="58" r="15" fill="#6A9AC0"/><circle cx="60" cy="48" r="10" fill="#A8CCE4"/><circle cx="60" cy="48" r="5" fill="#E8D478"/><path d="M56 68 Q60 95 58 110" stroke="#5B8A3C" stroke-width="2.5" fill="none"/><path d="M58 80 Q45 75 38 82" stroke="#5B8A3C" stroke-width="2" fill="none"/><ellipse cx="35" cy="84" rx="10" ry="5" fill="#6EA84F" transform="rotate(-30 35 84)"/><path d="M58 90 Q70 85 78 90" stroke="#5B8A3C" stroke-width="2" fill="none"/><ellipse cx="80" cy="92" rx="10" ry="5" fill="#6EA84F" transform="rotate(20 80 92)"/></g></svg>`
  },
  {
    id: 'flower-rose-pink-1',
    name: 'Rosa Rosada',
    category: 'flowers',
    width: 120,
    height: 120,
    tags: ['rosa', 'romántico'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g opacity="0.95"><circle cx="60" cy="50" r="18" fill="#E8A0B8"/><circle cx="48" cy="42" r="16" fill="#F0B0C4"/><circle cx="72" cy="42" r="16" fill="#F0B0C4"/><circle cx="52" cy="58" r="15" fill="#D68EA8"/><circle cx="68" cy="58" r="15" fill="#D68EA8"/><circle cx="60" cy="48" r="10" fill="#F5C6D4"/><circle cx="60" cy="48" r="5" fill="#F0D860"/><path d="M56 68 Q60 95 58 110" stroke="#5B8A3C" stroke-width="2.5" fill="none"/><ellipse cx="40" cy="85" rx="12" ry="6" fill="#7AAE58" transform="rotate(-25 40 85)"/><ellipse cx="78" cy="90" rx="12" ry="6" fill="#7AAE58" transform="rotate(25 78 90)"/></g></svg>`
  },
  {
    id: 'flower-rose-white-1',
    name: 'Rosa Blanca',
    category: 'flowers',
    width: 120,
    height: 120,
    tags: ['blanco', 'elegante', 'boda'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g opacity="0.9"><circle cx="60" cy="50" r="18" fill="#F5F0E8"/><circle cx="48" cy="42" r="16" fill="#FAF5ED"/><circle cx="72" cy="42" r="16" fill="#FAF5ED"/><circle cx="52" cy="58" r="15" fill="#EDE5D8"/><circle cx="68" cy="58" r="15" fill="#EDE5D8"/><circle cx="60" cy="48" r="10" fill="#FFFBF2"/><circle cx="60" cy="48" r="5" fill="#E8D478"/><path d="M56 68 Q60 95 58 110" stroke="#5B8A3C" stroke-width="2.5" fill="none"/><ellipse cx="38" cy="84" rx="12" ry="6" fill="#7AAE58" transform="rotate(-30 38 84)"/><ellipse cx="80" cy="90" rx="12" ry="6" fill="#7AAE58" transform="rotate(20 80 90)"/></g></svg>`
  },
  {
    id: 'flower-peony-1',
    name: 'Peonía',
    category: 'flowers',
    width: 130,
    height: 130,
    tags: ['rosa', 'grande', 'elegante'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><g opacity="0.95"><ellipse cx="65" cy="55" rx="28" ry="25" fill="#F2C4D0"/><ellipse cx="50" cy="48" rx="20" ry="22" fill="#E8B0C0"/><ellipse cx="80" cy="48" rx="20" ry="22" fill="#E8B0C0"/><ellipse cx="55" cy="65" rx="18" ry="20" fill="#D69AAE"/><ellipse cx="75" cy="65" rx="18" ry="20" fill="#D69AAE"/><ellipse cx="65" cy="52" rx="15" ry="12" fill="#F8D8E2"/><circle cx="65" cy="50" r="7" fill="#FFE8A0"/><path d="M62 75 Q65 105 63 125" stroke="#4A7A35" stroke-width="3" fill="none"/><ellipse cx="45" cy="95" rx="14" ry="7" fill="#6EA84F" transform="rotate(-20 45 95)"/><ellipse cx="82" cy="100" rx="14" ry="7" fill="#6EA84F" transform="rotate(25 82 100)"/></g></svg>`
  },
  {
    id: 'flower-lavender-1',
    name: 'Lavanda',
    category: 'flowers',
    width: 60,
    height: 140,
    tags: ['morado', 'delicado', 'vertical'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 140"><path d="M30 140 Q30 70 28 40" stroke="#6B8A4A" stroke-width="2" fill="none"/><ellipse cx="28" cy="38" rx="5" ry="7" fill="#9B8EC0"/><ellipse cx="33" cy="30" rx="5" ry="7" fill="#A89ACE"/><ellipse cx="24" cy="28" rx="5" ry="7" fill="#A89ACE"/><ellipse cx="30" cy="22" rx="5" ry="7" fill="#B8AADB"/><ellipse cx="26" cy="16" rx="4" ry="6" fill="#C4B8E0"/><ellipse cx="32" cy="12" rx="4" ry="5" fill="#D0C4E8"/><ellipse cx="29" cy="6" rx="3" ry="5" fill="#D8D0EE"/><path d="M28 80 Q18 75 12 80" stroke="#6B8A4A" stroke-width="1.5" fill="none"/><ellipse cx="10" cy="82" rx="8" ry="4" fill="#7AAE58" transform="rotate(-15 10 82)"/><path d="M29 100 Q38 95 45 100" stroke="#6B8A4A" stroke-width="1.5" fill="none"/><ellipse cx="47" cy="102" rx="8" ry="4" fill="#7AAE58" transform="rotate(15 47 102)"/></g></svg>`
  },
  {
    id: 'flower-eucalyptus-1',
    name: 'Eucalipto',
    category: 'flowers',
    width: 80,
    height: 160,
    tags: ['verde', 'natural', 'boho'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 160"><path d="M40 155 Q38 80 35 10" stroke="#5B7A3C" stroke-width="2" fill="none"/><ellipse cx="28" cy="20" rx="10" ry="14" fill="#8BAA6A" transform="rotate(-15 28 20)" opacity="0.8"/><ellipse cx="48" cy="35" rx="10" ry="14" fill="#7A9A5C" transform="rotate(15 48 35)" opacity="0.8"/><ellipse cx="25" cy="50" rx="10" ry="14" fill="#8BAA6A" transform="rotate(-10 25 50)" opacity="0.75"/><ellipse cx="50" cy="65" rx="10" ry="14" fill="#7A9A5C" transform="rotate(10 50 65)" opacity="0.75"/><ellipse cx="28" cy="80" rx="11" ry="15" fill="#8BAA6A" transform="rotate(-8 28 80)" opacity="0.7"/><ellipse cx="48" cy="95" rx="11" ry="15" fill="#7A9A5C" transform="rotate(8 48 95)" opacity="0.7"/><ellipse cx="30" cy="115" rx="12" ry="16" fill="#8BAA6A" transform="rotate(-5 30 115)" opacity="0.65"/><ellipse cx="46" cy="135" rx="12" ry="16" fill="#7A9A5C" transform="rotate(5 46 135)" opacity="0.65"/></svg>`
  },
  {
    id: 'flower-daisy-1',
    name: 'Margarita',
    category: 'flowers',
    width: 80,
    height: 80,
    tags: ['blanco', 'simple', 'alegre'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><g transform="translate(40,35)"><ellipse rx="8" ry="16" fill="#FEFEFE" stroke="#E8E0D0" stroke-width="0.5"/><ellipse rx="8" ry="16" fill="#FEFEFE" stroke="#E8E0D0" stroke-width="0.5" transform="rotate(45)"/><ellipse rx="8" ry="16" fill="#FEFEFE" stroke="#E8E0D0" stroke-width="0.5" transform="rotate(90)"/><ellipse rx="8" ry="16" fill="#FEFEFE" stroke="#E8E0D0" stroke-width="0.5" transform="rotate(135)"/><circle r="8" fill="#F0D860"/></g><path d="M40 52 Q40 70 38 78" stroke="#5B8A3C" stroke-width="2" fill="none"/></svg>`
  },
  {
    id: 'flower-bouquet-blue-1',
    name: 'Ramo Azul',
    category: 'flowers',
    width: 200,
    height: 200,
    tags: ['azul', 'ramo', 'grande', 'composición'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g opacity="0.95"><circle cx="80" cy="60" r="20" fill="#7BA7CC"/><circle cx="68" cy="52" r="18" fill="#8BB5D6"/><circle cx="92" cy="52" r="18" fill="#8BB5D6"/><circle cx="74" cy="70" r="16" fill="#6A9AC0"/><circle cx="86" cy="70" r="16" fill="#6A9AC0"/><circle cx="80" cy="58" r="10" fill="#A8CCE4"/><circle cx="120" cy="50" r="16" fill="#E8A0B8"/><circle cx="112" cy="44" r="14" fill="#F0B0C4"/><circle cx="128" cy="44" r="14" fill="#F0B0C4"/><circle cx="120" cy="48" r="8" fill="#F5C6D4"/><circle cx="120" cy="48" r="4" fill="#F0D860"/><circle cx="55" cy="45" r="14" fill="#F5F0E8"/><circle cx="48" cy="40" r="12" fill="#FAF5ED"/><circle cx="62" cy="40" r="12" fill="#FAF5ED"/><circle cx="55" cy="43" r="7" fill="#FFFBF2"/><circle cx="55" cy="43" r="3.5" fill="#E8D478"/><circle cx="140" cy="75" r="12" fill="#7BA7CC" opacity="0.7"/><circle cx="40" cy="72" r="12" fill="#8BB5D6" opacity="0.7"/><ellipse cx="60" cy="95" rx="16" ry="8" fill="#7AAE58" transform="rotate(-20 60 95)"/><ellipse cx="110" cy="90" rx="16" ry="8" fill="#6EA84F" transform="rotate(15 110 90)"/><ellipse cx="35" cy="88" rx="14" ry="7" fill="#8BAA6A" transform="rotate(-35 35 88)"/><ellipse cx="145" cy="90" rx="14" ry="7" fill="#8BAA6A" transform="rotate(30 145 90)"/><ellipse cx="80" cy="100" rx="18" ry="8" fill="#7AAE58" transform="rotate(5 80 100)"/><path d="M80 105 Q82 140 85 180" stroke="#5B7A3C" stroke-width="2.5" fill="none"/><path d="M82 105 Q100 130 115 170" stroke="#5B7A3C" stroke-width="2" fill="none"/><path d="M78 105 Q60 130 50 170" stroke="#5B7A3C" stroke-width="2" fill="none"/></g></svg>`
  },
]

// ── ESQUINAS DECORATIVAS ──
const corners: DecorativeElement[] = [
  {
    id: 'corner-floral-gold-1',
    name: 'Esquina Floral Dorada',
    category: 'corners',
    width: 150,
    height: 150,
    tags: ['dorado', 'floral', 'elegante'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"><g opacity="0.9"><path d="M5 5 Q5 75 5 145" stroke="#D4AF37" stroke-width="1.5" fill="none"/><path d="M5 5 Q75 5 145 5" stroke="#D4AF37" stroke-width="1.5" fill="none"/><path d="M5 5 Q40 40 30 70" stroke="#D4AF37" stroke-width="1" fill="none"/><path d="M5 5 Q40 40 70 30" stroke="#D4AF37" stroke-width="1" fill="none"/><circle cx="25" cy="25" r="12" fill="#D4AF37" opacity="0.15"/><circle cx="18" cy="18" r="3" fill="#D4AF37" opacity="0.6"/><circle cx="30" cy="12" r="2.5" fill="#D4AF37" opacity="0.5"/><circle cx="12" cy="30" r="2.5" fill="#D4AF37" opacity="0.5"/><ellipse cx="45" cy="20" rx="8" ry="5" fill="#8BAA6A" transform="rotate(15 45 20)" opacity="0.6"/><ellipse cx="20" cy="45" rx="8" ry="5" fill="#8BAA6A" transform="rotate(-15 20 45)" opacity="0.6"/><path d="M8 8 Q15 20 10 35" stroke="#B8962E" stroke-width="0.8" fill="none" opacity="0.5"/><path d="M8 8 Q20 15 35 10" stroke="#B8962E" stroke-width="0.8" fill="none" opacity="0.5"/></g></svg>`
  },
  {
    id: 'corner-floral-green-1',
    name: 'Esquina Verde Natural',
    category: 'corners',
    width: 150,
    height: 150,
    tags: ['verde', 'natural', 'hojas'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"><g opacity="0.85"><ellipse cx="30" cy="15" rx="18" ry="9" fill="#8BAA6A" transform="rotate(30 30 15)"/><ellipse cx="15" cy="30" rx="18" ry="9" fill="#7A9A5C" transform="rotate(-30 15 30)"/><ellipse cx="50" cy="10" rx="14" ry="7" fill="#9ABA7A" transform="rotate(15 50 10)"/><ellipse cx="10" cy="50" rx="14" ry="7" fill="#9ABA7A" transform="rotate(-15 10 50)"/><ellipse cx="65" cy="18" rx="10" ry="5" fill="#AACA8A" transform="rotate(10 65 18)"/><ellipse cx="18" cy="65" rx="10" ry="5" fill="#AACA8A" transform="rotate(-10 18 65)"/><path d="M5 5 Q25 10 35 5" stroke="#5B7A3C" stroke-width="1.5" fill="none"/><path d="M5 5 Q10 25 5 35" stroke="#5B7A3C" stroke-width="1.5" fill="none"/><circle cx="20" cy="20" r="8" fill="#7BA7CC" opacity="0.5"/><circle cx="20" cy="20" r="4" fill="#A8CCE4" opacity="0.6"/></g></svg>`
  },
  {
    id: 'corner-minimal-line-1',
    name: 'Esquina Línea Fina',
    category: 'corners',
    width: 100,
    height: 100,
    tags: ['minimalista', 'moderno', 'línea'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M5 95 L5 5 L95 5" stroke="#2C2C2C" stroke-width="1" fill="none"/><path d="M10 90 L10 10 L90 10" stroke="#2C2C2C" stroke-width="0.5" fill="none" opacity="0.4"/></svg>`
  },
  {
    id: 'corner-ornate-gold-1',
    name: 'Esquina Ornamental Dorada',
    category: 'corners',
    width: 120,
    height: 120,
    tags: ['dorado', 'ornamental', 'lujo'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="none" stroke="#D4AF37" opacity="0.85"><path d="M5 110 L5 5 L110 5" stroke-width="2"/><path d="M5 5 Q55 15 45 55" stroke-width="1.2"/><path d="M5 5 Q15 55 55 45" stroke-width="1.2"/><circle cx="20" cy="20" r="3" fill="#D4AF37"/><circle cx="35" cy="12" r="2" fill="#D4AF37"/><circle cx="12" cy="35" r="2" fill="#D4AF37"/><path d="M10 10 Q25 25 15 45" stroke-width="0.8"/><path d="M10 10 Q25 25 45 15" stroke-width="0.8"/><path d="M5 70 Q10 65 15 70 Q10 75 5 70Z" fill="#D4AF37" opacity="0.3"/><path d="M70 5 Q65 10 70 15 Q75 10 70 5Z" fill="#D4AF37" opacity="0.3"/></g></svg>`
  },
]

// ── DIVISORES / LÍNEAS ──
const dividers: DecorativeElement[] = [
  {
    id: 'divider-gold-ornate-1',
    name: 'Divisor Dorado Ornamental',
    category: 'dividers',
    width: 300,
    height: 30,
    tags: ['dorado', 'elegante'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 30"><g fill="#D4AF37" opacity="0.8"><line x1="20" y1="15" x2="130" y2="15" stroke="#D4AF37" stroke-width="1"/><line x1="170" y1="15" x2="280" y2="15" stroke="#D4AF37" stroke-width="1"/><circle cx="150" cy="15" r="4"/><circle cx="140" cy="15" r="2"/><circle cx="160" cy="15" r="2"/><path d="M135 15 Q130 8 125 15 Q130 22 135 15Z"/><path d="M165 15 Q170 8 175 15 Q170 22 165 15Z"/></g></svg>`
  },
  {
    id: 'divider-simple-line-1',
    name: 'Línea Simple',
    category: 'dividers',
    width: 200,
    height: 10,
    tags: ['simple', 'minimalista'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 10"><line x1="0" y1="5" x2="200" y2="5" stroke="#2C2C2C" stroke-width="1" opacity="0.5"/></svg>`
  },
  {
    id: 'divider-floral-1',
    name: 'Divisor Floral',
    category: 'dividers',
    width: 300,
    height: 40,
    tags: ['floral', 'elegante'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 40"><g opacity="0.8"><line x1="10" y1="20" x2="120" y2="20" stroke="#8BAA6A" stroke-width="1"/><line x1="180" y1="20" x2="290" y2="20" stroke="#8BAA6A" stroke-width="1"/><ellipse cx="135" cy="18" rx="8" ry="5" fill="#8BAA6A" transform="rotate(-20 135 18)"/><ellipse cx="165" cy="18" rx="8" ry="5" fill="#8BAA6A" transform="rotate(20 165 18)"/><circle cx="150" cy="16" r="6" fill="#E8B4B8"/><circle cx="150" cy="16" r="3" fill="#F5D0D8"/><ellipse cx="140" cy="24" rx="6" ry="4" fill="#9ABA7A" transform="rotate(10 140 24)"/><ellipse cx="160" cy="24" rx="6" ry="4" fill="#9ABA7A" transform="rotate(-10 160 24)"/></g></svg>`
  },
  {
    id: 'divider-hearts-1',
    name: 'Divisor Corazones',
    category: 'dividers',
    width: 250,
    height: 30,
    tags: ['corazón', 'romántico'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 30"><g opacity="0.7"><line x1="10" y1="15" x2="100" y2="15" stroke="#D4AF37" stroke-width="0.8"/><line x1="150" y1="15" x2="240" y2="15" stroke="#D4AF37" stroke-width="0.8"/><path d="M117 10 Q117 5 122 5 Q127 5 127 10 Q127 18 122 22 Q117 18 117 10Z" fill="#D4AF37" opacity="0.6"/><path d="M123 10 Q123 5 128 5 Q133 5 133 10 Q133 18 128 22 Q123 18 123 10Z" fill="#D4AF37" opacity="0.6"/></g></svg>`
  },
  {
    id: 'divider-diamond-1',
    name: 'Divisor Diamante',
    category: 'dividers',
    width: 250,
    height: 20,
    tags: ['geométrico', 'moderno'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 20"><g opacity="0.7"><line x1="10" y1="10" x2="110" y2="10" stroke="#2C2C2C" stroke-width="0.8"/><line x1="140" y1="10" x2="240" y2="10" stroke="#2C2C2C" stroke-width="0.8"/><rect x="118" y="3" width="14" height="14" fill="none" stroke="#2C2C2C" stroke-width="1" transform="rotate(45 125 10)"/></g></svg>`
  },
]

// ── MARCOS ──
const frames: DecorativeElement[] = [
  {
    id: 'frame-gold-rect-1',
    name: 'Marco Dorado Rectangular',
    category: 'frames',
    width: 350,
    height: 500,
    tags: ['dorado', 'rectangular', 'elegante'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 500"><rect x="15" y="15" width="320" height="470" rx="2" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.7"/><rect x="25" y="25" width="300" height="450" rx="1" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.4"/></svg>`
  },
  {
    id: 'frame-floral-rect-1',
    name: 'Marco Floral',
    category: 'frames',
    width: 380,
    height: 540,
    tags: ['floral', 'elegante', 'boda'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 540"><rect x="30" y="30" width="320" height="480" fill="none" stroke="#8BAA6A" stroke-width="1" opacity="0.5"/><g opacity="0.8"><ellipse cx="30" cy="30" rx="20" ry="10" fill="#8BAA6A" transform="rotate(45 30 30)"/><ellipse cx="40" cy="20" rx="15" ry="8" fill="#9ABA7A" transform="rotate(30 40 20)"/><circle cx="30" cy="30" r="8" fill="#7BA7CC"/><circle cx="30" cy="30" r="4" fill="#A8CCE4"/><ellipse cx="350" cy="30" rx="20" ry="10" fill="#8BAA6A" transform="rotate(-45 350 30)"/><ellipse cx="340" cy="20" rx="15" ry="8" fill="#9ABA7A" transform="rotate(-30 340 20)"/><circle cx="350" cy="30" r="8" fill="#E8A0B8"/><circle cx="350" cy="30" r="4" fill="#F5C6D4"/><ellipse cx="30" cy="510" rx="20" ry="10" fill="#8BAA6A" transform="rotate(-45 30 510)"/><ellipse cx="40" cy="520" rx="15" ry="8" fill="#9ABA7A" transform="rotate(-30 40 520)"/><circle cx="30" cy="510" r="8" fill="#E8A0B8"/><circle cx="30" cy="510" r="4" fill="#F5C6D4"/><ellipse cx="350" cy="510" rx="20" ry="10" fill="#8BAA6A" transform="rotate(45 350 510)"/><ellipse cx="340" cy="520" rx="15" ry="8" fill="#9ABA7A" transform="rotate(30 340 520)"/><circle cx="350" cy="510" r="8" fill="#7BA7CC"/><circle cx="350" cy="510" r="4" fill="#A8CCE4"/></g></svg>`
  },
  {
    id: 'frame-arch-1',
    name: 'Arco Elegante',
    category: 'frames',
    width: 300,
    height: 420,
    tags: ['arco', 'elegante', 'moderno'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420"><path d="M30 420 L30 120 Q30 20 150 20 Q270 20 270 120 L270 420" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/><path d="M40 420 L40 125 Q40 30 150 30 Q260 30 260 125 L260 420" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.35"/></svg>`
  },
]

// ── ORNAMENTOS ──
const ornaments: DecorativeElement[] = [
  {
    id: 'ornament-rings-1',
    name: 'Anillos de Boda',
    category: 'ornaments',
    width: 80,
    height: 60,
    tags: ['boda', 'anillos', 'dorado'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60"><circle cx="30" cy="30" r="15" fill="none" stroke="#D4AF37" stroke-width="2.5"/><circle cx="50" cy="30" r="15" fill="none" stroke="#D4AF37" stroke-width="2.5"/><circle cx="40" cy="12" r="3" fill="#D4AF37"/></svg>`
  },
  {
    id: 'ornament-heart-1',
    name: 'Corazón Dorado',
    category: 'ornaments',
    width: 60,
    height: 60,
    tags: ['corazón', 'amor', 'dorado'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><path d="M30 52 Q5 35 5 18 Q5 5 18 5 Q25 5 30 12 Q35 5 42 5 Q55 5 55 18 Q55 35 30 52Z" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/></svg>`
  },
  {
    id: 'ornament-ampersand-1',
    name: '& Decorativo',
    category: 'ornaments',
    width: 80,
    height: 80,
    tags: ['ampersand', 'texto', 'dorado'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><text x="40" y="58" font-family="Great Vibes, cursive" font-size="60" fill="#D4AF37" text-anchor="middle" opacity="0.8">&amp;</text></svg>`
  },
  {
    id: 'ornament-monogram-circle-1',
    name: 'Círculo Monograma',
    category: 'ornaments',
    width: 120,
    height: 120,
    tags: ['monograma', 'círculo', 'elegante'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.6"/><circle cx="60" cy="60" r="45" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.3"/><ellipse cx="35" cy="15" rx="8" ry="5" fill="#8BAA6A" transform="rotate(40 35 15)" opacity="0.5"/><ellipse cx="85" cy="15" rx="8" ry="5" fill="#8BAA6A" transform="rotate(-40 85 15)" opacity="0.5"/></svg>`
  },
  {
    id: 'ornament-cross-1',
    name: 'Cruz Religiosa',
    category: 'ornaments',
    width: 50,
    height: 70,
    tags: ['religioso', 'cruz', 'dorado'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 70"><rect x="20" y="5" width="10" height="60" rx="1" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/><rect x="8" y="18" width="34" height="10" rx="1" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/></svg>`
  },
  {
    id: 'ornament-infinity-1',
    name: 'Infinito',
    category: 'ornaments',
    width: 100,
    height: 50,
    tags: ['infinito', 'amor', 'moderno'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><path d="M50 25 Q30 5 15 25 Q0 45 15 25 Q30 5 50 25 Q70 45 85 25 Q100 5 85 25 Q70 45 50 25" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/></svg>`
  },
]

// ── ICONOS ──
const icons: DecorativeElement[] = [
  {
    id: 'icon-church-1',
    name: 'Iglesia',
    category: 'icons',
    width: 60,
    height: 70,
    tags: ['iglesia', 'ceremonia', 'religioso'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 70"><g fill="none" stroke="#4A4A4A" stroke-width="1.2" opacity="0.6"><rect x="10" y="30" width="40" height="35" rx="1"/><path d="M5 30 L30 12 L55 30"/><rect x="23" y="45" width="14" height="20" rx="7 7 0 0"/><line x1="30" y1="2" x2="30" y2="12"/><line x1="25" y1="7" x2="35" y2="7"/><circle cx="30" cy="35" r="5"/></g></svg>`
  },
  {
    id: 'icon-champagne-1',
    name: 'Champagne',
    category: 'icons',
    width: 60,
    height: 70,
    tags: ['celebración', 'brindis', 'fiesta'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 70"><g fill="none" stroke="#D4AF37" stroke-width="1.2" opacity="0.7"><path d="M18 10 L22 40"/><path d="M32 10 L28 40"/><ellipse cx="25" cy="42" rx="8" ry="3"/><line x1="25" y1="45" x2="25" y2="60"/><line x1="18" y1="60" x2="32" y2="60"/><path d="M38 10 L42 40"/><path d="M52 10 L48 40"/><ellipse cx="45" cy="42" rx="8" ry="3"/><line x1="45" y1="45" x2="45" y2="60"/><line x1="38" y1="60" x2="52" y2="60"/><path d="M28 38 Q35 30 42 38" stroke-dasharray="2 2"/></g></svg>`
  },
  {
    id: 'icon-cake-1',
    name: 'Pastel',
    category: 'icons',
    width: 60,
    height: 70,
    tags: ['pastel', 'celebración'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 70"><g fill="none" stroke="#4A4A4A" stroke-width="1.2" opacity="0.6"><rect x="8" y="40" width="44" height="15" rx="2"/><rect x="14" y="28" width="32" height="14" rx="2"/><rect x="20" y="16" width="20" height="14" rx="2"/><line x1="30" y1="8" x2="30" y2="16"/><circle cx="30" cy="6" r="2" fill="#D4AF37"/><path d="M8 55 Q30 62 52 55"/></g></svg>`
  },
  {
    id: 'icon-calendar-1',
    name: 'Calendario',
    category: 'icons',
    width: 50,
    height: 55,
    tags: ['fecha', 'calendario'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 55"><g fill="none" stroke="#4A4A4A" stroke-width="1.2" opacity="0.6"><rect x="5" y="10" width="40" height="38" rx="3"/><line x1="5" y1="22" x2="45" y2="22"/><line x1="15" y1="5" x2="15" y2="15"/><line x1="35" y1="5" x2="35" y2="15"/><circle cx="18" cy="32" r="2" fill="#D4AF37"/><circle cx="32" cy="32" r="2" fill="#D4AF37"/><circle cx="25" cy="40" r="2" fill="#D4AF37"/></g></svg>`
  },
  {
    id: 'icon-map-pin-1',
    name: 'Ubicación',
    category: 'icons',
    width: 40,
    height: 55,
    tags: ['ubicación', 'mapa', 'lugar'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 55"><path d="M20 50 Q20 35 8 22 Q0 12 8 5 Q14 0 20 0 Q26 0 32 5 Q40 12 32 22 Q20 35 20 50Z" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/><circle cx="20" cy="16" r="6" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/></svg>`
  },
  {
    id: 'icon-clock-1',
    name: 'Reloj',
    category: 'icons',
    width: 45,
    height: 45,
    tags: ['hora', 'tiempo', 'reloj'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><circle cx="22.5" cy="22.5" r="18" fill="none" stroke="#4A4A4A" stroke-width="1.2" opacity="0.6"/><line x1="22.5" y1="22.5" x2="22.5" y2="12" stroke="#4A4A4A" stroke-width="1.5" opacity="0.6"/><line x1="22.5" y1="22.5" x2="32" y2="22.5" stroke="#4A4A4A" stroke-width="1" opacity="0.6"/><circle cx="22.5" cy="22.5" r="2" fill="#D4AF37"/></svg>`
  },
]

// ── FONDOS / TEXTURAS ──
const backgrounds: DecorativeElement[] = [
  {
    id: 'bg-watercolor-blue-1',
    name: 'Acuarela Azul',
    category: 'backgrounds',
    width: 400,
    height: 600,
    tags: ['acuarela', 'azul', 'fondo'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="#F8FBFF"/><ellipse cx="50" cy="50" rx="100" ry="80" fill="#D4E8F5" opacity="0.3"/><ellipse cx="350" cy="100" rx="80" ry="120" fill="#C4D8E8" opacity="0.2"/><ellipse cx="80" cy="550" rx="120" ry="80" fill="#D4E8F5" opacity="0.25"/><ellipse cx="320" cy="500" rx="100" ry="120" fill="#C4D8E8" opacity="0.2"/></svg>`
  },
  {
    id: 'bg-watercolor-pink-1',
    name: 'Acuarela Rosa',
    category: 'backgrounds',
    width: 400,
    height: 600,
    tags: ['acuarela', 'rosa', 'fondo'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="#FFFAF8"/><ellipse cx="50" cy="50" rx="100" ry="80" fill="#F5D4DC" opacity="0.3"/><ellipse cx="350" cy="100" rx="80" ry="120" fill="#F0C4D0" opacity="0.2"/><ellipse cx="80" cy="550" rx="120" ry="80" fill="#F5D4DC" opacity="0.25"/><ellipse cx="320" cy="500" rx="100" ry="120" fill="#F0C4D0" opacity="0.2"/></svg>`
  },
  {
    id: 'bg-linen-texture-1',
    name: 'Textura Lino',
    category: 'backgrounds',
    width: 400,
    height: 600,
    tags: ['textura', 'natural', 'fondo'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="#F5F0E8"/><g opacity="0.05" stroke="#8B7355"><line x1="0" y1="0" x2="400" y2="0" stroke-width="1"/><line x1="0" y1="10" x2="400" y2="10" stroke-width="0.5"/><line x1="0" y1="20" x2="400" y2="20" stroke-width="1"/><line x1="0" y1="30" x2="400" y2="30" stroke-width="0.5"/></g></svg>`
  },
]

// ============================================
// EXPORTAR TODOS LOS ELEMENTOS
// ============================================
export const allElements: DecorativeElement[] = [
  ...flowers,
  ...corners,
  ...dividers,
  ...frames,
  ...ornaments,
  ...icons,
  ...backgrounds,
]

export const elementCategories = [
  { id: 'flowers', name: 'Flores', icon: '🌸', count: flowers.length },
  { id: 'corners', name: 'Esquinas', icon: '🔲', count: corners.length },
  { id: 'dividers', name: 'Divisores', icon: '➖', count: dividers.length },
  { id: 'frames', name: 'Marcos', icon: '🖼️', count: frames.length },
  { id: 'ornaments', name: 'Ornamentos', icon: '✨', count: ornaments.length },
  { id: 'icons', name: 'Iconos', icon: '📍', count: icons.length },
  { id: 'backgrounds', name: 'Fondos', icon: '🎨', count: backgrounds.length },
]

export const getElementsByCategory = (category: string): DecorativeElement[] => {
  return allElements.filter(e => e.category === category)
}

export const searchElements = (query: string): DecorativeElement[] => {
  const q = query.toLowerCase()
  return allElements.filter(e => 
    e.name.toLowerCase().includes(q) || 
    e.tags.some(t => t.includes(q))
  )
}
