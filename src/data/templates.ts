import type { Template } from '@/types'

// ============================================
// PALETAS DE COLORES PROFESIONALES
// ============================================
const colorPalettes = {
  // Dorados y clásicos
  goldClassic: { primary: '#D4AF37', secondary: '#FFFFFF', accent: '#1a1a1a', background: '#FDFBF7', text: '#2C2C2C' },
  roseGold: { primary: '#B76E79', secondary: '#F5E1E0', accent: '#E8C4C4', background: '#FFF5F5', text: '#4A3333' },
  champagne: { primary: '#C9B38C', secondary: '#F7F3ED', accent: '#DDD0BB', background: '#FFFDF8', text: '#5C4B35' },
  // Modernos y oscuros
  blackWhite: { primary: '#000000', secondary: '#FFFFFF', accent: '#E8E8E8', background: '#FFFFFF', text: '#000000' },
  darkElegant: { primary: '#C9A227', secondary: '#1A1A2E', accent: '#16213E', background: '#0F0F1A', text: '#FFFFFF' },
  midnightBlue: { primary: '#FFD700', secondary: '#0D1B2A', accent: '#1B263B', background: '#0D1B2A', text: '#E0E1DD' },
  charcoalGold: { primary: '#DAA520', secondary: '#2D2D2D', accent: '#444444', background: '#1A1A1A', text: '#F5F5F5' },
  // Naturales y cálidos
  sage: { primary: '#8B9A7D', secondary: '#F5E6E0', accent: '#C5CEB8', background: '#F8F6F0', text: '#3D4A35' },
  terracotta: { primary: '#C67A52', secondary: '#F5E6D8', accent: '#E8C5A8', background: '#FDF6F0', text: '#5C3D2E' },
  dustyRose: { primary: '#E8B4B8', secondary: '#8B9A7D', accent: '#F5E6E8', background: '#FDF8F8', text: '#4A4A4A' },
  olive: { primary: '#6B7B3A', secondary: '#F5F0E0', accent: '#A8B570', background: '#FAFAF0', text: '#3A3F2A' },
  burgundy: { primary: '#800020', secondary: '#F5E6E0', accent: '#C0A080', background: '#FFF8F4', text: '#3D2020' },
  forestGreen: { primary: '#1B4D3E', secondary: '#D4AF37', accent: '#E8F5E9', background: '#FFFFFF', text: '#1B4D3E' },
  rustic: { primary: '#C4A484', secondary: '#8B7355', accent: '#E8DDD4', background: '#F5F0EB', text: '#5D4E37' },
  // Suaves y pasteles
  lavender: { primary: '#9B8EC0', secondary: '#F0EDF5', accent: '#C4B8DB', background: '#FAF8FF', text: '#4A3D5C' },
  blushPink: { primary: '#E8A0BF', secondary: '#FFF0F5', accent: '#F5C6D0', background: '#FFF5F8', text: '#5C3348' },
  mintGreen: { primary: '#6FB98F', secondary: '#F0FFF5', accent: '#A8D8C0', background: '#F5FFF8', text: '#2D5940' },
  skyBlue: { primary: '#5B8FA8', secondary: '#F0F8FF', accent: '#A8D0E8', background: '#F5FAFF', text: '#2D4050' },
  peach: { primary: '#E8956E', secondary: '#FFF3ED', accent: '#F5C4A8', background: '#FFFAF5', text: '#5C3D2E' },
  coral: { primary: '#FF6F61', secondary: '#FFF0ED', accent: '#FFA69E', background: '#FFFAF8', text: '#4A2D28' },
  mauve: { primary: '#B07AA1', secondary: '#F5EDF3', accent: '#D4A8C8', background: '#FDF8FC', text: '#4A3045' },
  // Elegantes
  navyGold: { primary: '#D4AF37', secondary: '#0A1628', accent: '#1B2D4F', background: '#0A1628', text: '#F5F0E0' },
  emeraldGold: { primary: '#D4AF37', secondary: '#004D40', accent: '#00695C', background: '#E0F2F1', text: '#1B3530' },
  plumSilver: { primary: '#C0C0C0', secondary: '#4A0E4E', accent: '#6A1B6D', background: '#F8F0F8', text: '#2D0A2E' },
  ivoryBlack: { primary: '#2C2C2C', secondary: '#FFFFF0', accent: '#D4D4C8', background: '#FFFFF0', text: '#2C2C2C' },
  // Vibrantes
  royalPurple: { primary: '#7B2D8E', secondary: '#F5E6FF', accent: '#C78FD4', background: '#FDF5FF', text: '#3D1A48' },
  sunflower: { primary: '#F4A300', secondary: '#FFFDE8', accent: '#FFD54F', background: '#FFFEF5', text: '#4A3800' },
  oceanBlue: { primary: '#1565C0', secondary: '#E3F2FD', accent: '#64B5F6', background: '#F5FAFF', text: '#0D3B66' },
}

// ============================================
// COMBINACIONES DE FUENTES PROFESIONALES
// ============================================
const fontCombinations = {
  classicElegant: { heading: 'Playfair Display', body: 'Cormorant Garamond' },
  modernClean: { heading: 'Montserrat', body: 'Inter' },
  romanticScript: { heading: 'Great Vibes', body: 'Lato' },
  rusticHandwritten: { heading: 'Amatic SC', body: 'Josefin Sans' },
  luxurySerif: { heading: 'Cinzel', body: 'Raleway' },
  artDeco: { heading: 'Poiret One', body: 'Quicksand' },
  timelessSerif: { heading: 'Playfair Display', body: 'Montserrat' },
  softElegant: { heading: 'Cormorant Garamond', body: 'Raleway' },
  boldModern: { heading: 'Montserrat', body: 'Quicksand' },
  scriptSerif: { heading: 'Great Vibes', body: 'Cormorant Garamond' },
}

// ============================================
// DEFINICIÓN DE PLANTILLAS (50+)
// ============================================
const templateDefinitions: Array<{
  id: string; name: string; category: Template['category'];
  palette: keyof typeof colorPalettes; fonts: keyof typeof fontCombinations;
  tags?: string[];
}> = [
  // ──── BODAS - Clásicas ────
  { id: 'wedding-gold-classic', name: 'Dorada Clásica', category: 'wedding', palette: 'goldClassic', fonts: 'classicElegant', tags: ['popular', 'elegante'] },
  { id: 'wedding-rose-gold', name: 'Oro Rosa', category: 'wedding', palette: 'roseGold', fonts: 'classicElegant', tags: ['popular', 'romántico'] },
  { id: 'wedding-champagne', name: 'Champagne', category: 'wedding', palette: 'champagne', fonts: 'softElegant', tags: ['elegante'] },
  { id: 'wedding-ivory-black', name: 'Marfil & Negro', category: 'wedding', palette: 'ivoryBlack', fonts: 'timelessSerif', tags: ['elegante'] },
  { id: 'wedding-navy-gold', name: 'Azul Marino & Oro', category: 'wedding', palette: 'navyGold', fonts: 'luxurySerif', tags: ['popular', 'elegante'] },
  { id: 'wedding-emerald-gold', name: 'Esmeralda & Oro', category: 'wedding', palette: 'emeraldGold', fonts: 'luxurySerif', tags: ['elegante'] },
  { id: 'wedding-plum-silver', name: 'Ciruela & Plata', category: 'wedding', palette: 'plumSilver', fonts: 'classicElegant', tags: ['elegante'] },

  // ──── BODAS - Modernas ────
  { id: 'wedding-black-white', name: 'Minimalista B&N', category: 'wedding', palette: 'blackWhite', fonts: 'modernClean', tags: ['popular', 'moderno'] },
  { id: 'wedding-modern-bold', name: 'Moderna Audaz', category: 'wedding', palette: 'blackWhite', fonts: 'boldModern', tags: ['moderno'] },
  { id: 'wedding-charcoal-gold', name: 'Carbón & Oro', category: 'wedding', palette: 'charcoalGold', fonts: 'modernClean', tags: ['moderno', 'elegante'] },
  { id: 'wedding-midnight-blue', name: 'Azul Medianoche', category: 'wedding', palette: 'midnightBlue', fonts: 'luxurySerif', tags: ['moderno', 'elegante'] },
  { id: 'wedding-dark-elegant', name: 'Oscura Elegante', category: 'wedding', palette: 'darkElegant', fonts: 'artDeco', tags: ['moderno'] },

  // ──── BODAS - Románticas ────
  { id: 'wedding-dusty-rose', name: 'Rosa Antiguo', category: 'wedding', palette: 'dustyRose', fonts: 'romanticScript', tags: ['popular', 'romántico'] },
  { id: 'wedding-blush-pink', name: 'Rosa Suave', category: 'wedding', palette: 'blushPink', fonts: 'romanticScript', tags: ['romántico'] },
  { id: 'wedding-mauve-dream', name: 'Sueño Malva', category: 'wedding', palette: 'mauve', fonts: 'scriptSerif', tags: ['romántico'] },
  { id: 'wedding-coral-love', name: 'Coral Enamorado', category: 'wedding', palette: 'coral', fonts: 'romanticScript', tags: ['romántico'] },
  { id: 'wedding-peach-romance', name: 'Durazno Romántico', category: 'wedding', palette: 'peach', fonts: 'scriptSerif', tags: ['romántico'] },
  { id: 'wedding-lavender', name: 'Lavanda', category: 'wedding', palette: 'lavender', fonts: 'romanticScript', tags: ['romántico', 'suave'] },

  // ──── BODAS - Naturaleza ────
  { id: 'wedding-sage-green', name: 'Verde Salvia', category: 'wedding', palette: 'sage', fonts: 'softElegant', tags: ['popular', 'natural'] },
  { id: 'wedding-olive-garden', name: 'Jardín de Olivos', category: 'wedding', palette: 'olive', fonts: 'timelessSerif', tags: ['natural'] },
  { id: 'wedding-forest', name: 'Bosque Encantado', category: 'wedding', palette: 'forestGreen', fonts: 'luxurySerif', tags: ['natural', 'elegante'] },
  { id: 'wedding-mint-fresh', name: 'Menta Fresca', category: 'wedding', palette: 'mintGreen', fonts: 'modernClean', tags: ['natural', 'fresco'] },
  { id: 'wedding-terracotta', name: 'Terracota', category: 'wedding', palette: 'terracotta', fonts: 'rusticHandwritten', tags: ['natural', 'cálido'] },
  { id: 'wedding-rustic-boho', name: 'Rústica Bohemia', category: 'wedding', palette: 'rustic', fonts: 'rusticHandwritten', tags: ['popular', 'boho'] },

  // ──── BODAS - Playa & Destino ────
  { id: 'wedding-ocean-blue', name: 'Azul Océano', category: 'wedding', palette: 'oceanBlue', fonts: 'modernClean', tags: ['playa'] },
  { id: 'wedding-sky-blue', name: 'Cielo Azul', category: 'wedding', palette: 'skyBlue', fonts: 'softElegant', tags: ['playa', 'suave'] },
  { id: 'wedding-sunset-coral', name: 'Atardecer Coral', category: 'wedding', palette: 'coral', fonts: 'modernClean', tags: ['playa'] },
  { id: 'wedding-tropical', name: 'Tropical', category: 'wedding', palette: 'forestGreen', fonts: 'boldModern', tags: ['playa', 'tropical'] },

  // ──── BODAS - Lujo ────
  { id: 'wedding-art-deco', name: 'Art Decó', category: 'wedding', palette: 'darkElegant', fonts: 'artDeco', tags: ['lujo'] },
  { id: 'wedding-royal-purple', name: 'Púrpura Real', category: 'wedding', palette: 'royalPurple', fonts: 'luxurySerif', tags: ['lujo'] },
  { id: 'wedding-burgundy-gold', name: 'Borgoña & Oro', category: 'wedding', palette: 'burgundy', fonts: 'classicElegant', tags: ['popular', 'lujo'] },
  { id: 'wedding-black-gold', name: 'Negro & Oro', category: 'wedding', palette: 'charcoalGold', fonts: 'luxurySerif', tags: ['lujo'] },

  // ──── BODAS - Estaciones ────
  { id: 'wedding-spring-garden', name: 'Jardín Primaveral', category: 'wedding', palette: 'mintGreen', fonts: 'romanticScript', tags: ['primavera'] },
  { id: 'wedding-summer-sun', name: 'Sol de Verano', category: 'wedding', palette: 'sunflower', fonts: 'boldModern', tags: ['verano'] },
  { id: 'wedding-autumn-harvest', name: 'Cosecha Otoñal', category: 'wedding', palette: 'terracotta', fonts: 'timelessSerif', tags: ['otoño'] },
  { id: 'wedding-winter-frost', name: 'Escarcha Invernal', category: 'wedding', palette: 'skyBlue', fonts: 'classicElegant', tags: ['invierno'] },
  { id: 'wedding-winter-night', name: 'Noche de Invierno', category: 'wedding', palette: 'midnightBlue', fonts: 'artDeco', tags: ['invierno'] },

  // ──── CUMPLEAÑOS ────
  { id: 'birthday-golden', name: 'Dorado Festivo', category: 'birthday', palette: 'goldClassic', fonts: 'boldModern', tags: ['elegante'] },
  { id: 'birthday-modern', name: 'Moderno', category: 'birthday', palette: 'blackWhite', fonts: 'modernClean', tags: ['moderno'] },
  { id: 'birthday-pink-party', name: 'Fiesta Rosa', category: 'birthday', palette: 'blushPink', fonts: 'boldModern', tags: ['divertido'] },
  { id: 'birthday-neon-night', name: 'Noche Neón', category: 'birthday', palette: 'darkElegant', fonts: 'artDeco', tags: ['fiesta'] },
  { id: 'birthday-tropical', name: 'Tropical Fun', category: 'birthday', palette: 'coral', fonts: 'rusticHandwritten', tags: ['divertido'] },
  { id: 'birthday-elegant-50', name: 'Elegante 50+', category: 'birthday', palette: 'navyGold', fonts: 'luxurySerif', tags: ['elegante'] },
  { id: 'birthday-kids-fun', name: 'Infantil Alegre', category: 'birthday', palette: 'sunflower', fonts: 'rusticHandwritten', tags: ['infantil'] },
  { id: 'birthday-purple-glam', name: 'Púrpura Glam', category: 'birthday', palette: 'royalPurple', fonts: 'boldModern', tags: ['glam'] },

  // ──── BABY SHOWER ────
  { id: 'baby-blue-clouds', name: 'Nubes Azules', category: 'baby_shower', palette: 'skyBlue', fonts: 'softElegant', tags: ['niño'] },
  { id: 'baby-pink-dreams', name: 'Sueños Rosados', category: 'baby_shower', palette: 'blushPink', fonts: 'romanticScript', tags: ['niña'] },
  { id: 'baby-mint-neutral', name: 'Menta Neutral', category: 'baby_shower', palette: 'mintGreen', fonts: 'modernClean', tags: ['neutral'] },
  { id: 'baby-lavender', name: 'Lavanda Dulce', category: 'baby_shower', palette: 'lavender', fonts: 'softElegant', tags: ['neutral'] },
  { id: 'baby-safari', name: 'Safari', category: 'baby_shower', palette: 'terracotta', fonts: 'rusticHandwritten', tags: ['temático'] },
  { id: 'baby-rustic', name: 'Rústico Tierno', category: 'baby_shower', palette: 'rustic', fonts: 'rusticHandwritten', tags: ['natural'] },

  // ──── GRADUACIÓN ────
  { id: 'grad-classic-blue', name: 'Azul Académico', category: 'graduation', palette: 'navyGold', fonts: 'luxurySerif', tags: ['clásico'] },
  { id: 'grad-modern-black', name: 'Negro Moderno', category: 'graduation', palette: 'charcoalGold', fonts: 'modernClean', tags: ['moderno'] },
  { id: 'grad-celebration', name: 'Celebración', category: 'graduation', palette: 'goldClassic', fonts: 'classicElegant', tags: ['elegante'] },
  { id: 'grad-purple-pride', name: 'Orgullo Púrpura', category: 'graduation', palette: 'royalPurple', fonts: 'boldModern', tags: ['moderno'] },

  // ──── CORPORATIVO ────
  { id: 'corp-professional', name: 'Profesional', category: 'corporate', palette: 'blackWhite', fonts: 'modernClean', tags: ['formal'] },
  { id: 'corp-navy-formal', name: 'Azul Formal', category: 'corporate', palette: 'navyGold', fonts: 'timelessSerif', tags: ['formal'] },
  { id: 'corp-modern-green', name: 'Verde Corporativo', category: 'corporate', palette: 'forestGreen', fonts: 'boldModern', tags: ['moderno'] },
  { id: 'corp-elegant-dark', name: 'Elegante Oscuro', category: 'corporate', palette: 'midnightBlue', fonts: 'luxurySerif', tags: ['formal'] },
]

// ============================================
// GENERADOR DE PLANTILLAS
// ============================================
function generateTemplates(): Template[] {
  return templateDefinitions.map(def => ({
    id: def.id,
    name: def.name,
    category: def.category,
    thumbnail: '',
    preview_image: '',
    colors: colorPalettes[def.palette],
    fonts: fontCombinations[def.fonts],
    canvas_data: "",
  }))
}

export const allTemplates: Template[] = generateTemplates()

export const weddingTemplates = allTemplates.filter(t => t.category === 'wedding')
export const birthdayTemplates = allTemplates.filter(t => t.category === 'birthday')
export const babyShowerTemplates = allTemplates.filter(t => t.category === 'baby_shower')
export const graduationTemplates = allTemplates.filter(t => t.category === 'graduation')
export const corporateTemplates = allTemplates.filter(t => t.category === 'corporate')

export const getTemplateById = (id: string): Template | undefined => {
  return allTemplates.find(t => t.id === id)
}

export const getTemplatesByCategory = (category: string): Template[] => {
  return allTemplates.filter(t => t.category === category)
}

export const getPopularTemplates = (): Template[] => {
  const popularIds = templateDefinitions
    .filter(d => d.tags?.includes('popular'))
    .map(d => d.id)
  return allTemplates.filter(t => popularIds.includes(t.id))
}

export const getTemplatesByTag = (tag: string): Template[] => {
  const ids = templateDefinitions
    .filter(d => d.tags?.includes(tag))
    .map(d => d.id)
  return allTemplates.filter(t => ids.includes(t.id))
}

export const categories = [
  { id: 'wedding', name: 'Bodas', icon: '💍' },
  { id: 'birthday', name: 'Cumpleaños', icon: '🎂' },
  { id: 'baby_shower', name: 'Baby Shower', icon: '👶' },
  { id: 'graduation', name: 'Graduación', icon: '🎓' },
  { id: 'corporate', name: 'Corporativo', icon: '🏢' },
]
