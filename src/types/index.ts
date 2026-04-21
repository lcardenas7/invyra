export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Event {
  id: string
  user_id: string
  name: string
  slug: string
  event_type: 'wedding' | 'birthday' | 'baby_shower' | 'graduation' | 'corporate' | 'other'
  date: string
  time: string
  location: string
  location_url?: string
  template_id: string
  canvas_data?: string
  cover_image?: string
  bride_name?: string
  groom_name?: string
  story?: string
  dress_code?: string
  gift_registry?: string
  bank_info?: string
  music_url?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  event_id: string
  name: string
  email?: string
  phone?: string
  status: 'pending' | 'confirmed' | 'declined'
  companions: number
  message?: string
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  event_id: string
  guest_id?: string
  guest_name?: string
  url: string
  thumbnail_url?: string
  caption?: string
  is_approved: boolean
  created_at: string
}

export interface Message {
  id: string
  event_id: string
  guest_name: string
  content: string
  created_at: string
}

export interface Template {
  id: string
  name: string
  category: 'wedding' | 'birthday' | 'baby_shower' | 'graduation' | 'corporate' | 'other'
  thumbnail: string
  preview_image: string
  canvas_data: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
}
