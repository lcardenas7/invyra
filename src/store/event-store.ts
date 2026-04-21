import { create } from 'zustand'
import type { Event, Guest, Photo, Template } from '@/types'

interface EventStore {
  currentEvent: Event | null
  guests: Guest[]
  photos: Photo[]
  selectedTemplate: Template | null
  isLoading: boolean
  
  setCurrentEvent: (event: Event | null) => void
  setGuests: (guests: Guest[]) => void
  addGuest: (guest: Guest) => void
  updateGuest: (id: string, data: Partial<Guest>) => void
  setPhotos: (photos: Photo[]) => void
  addPhoto: (photo: Photo) => void
  removePhoto: (id: string) => void
  setSelectedTemplate: (template: Template | null) => void
  setIsLoading: (loading: boolean) => void
}

export const useEventStore = create<EventStore>((set) => ({
  currentEvent: null,
  guests: [],
  photos: [],
  selectedTemplate: null,
  isLoading: false,

  setCurrentEvent: (event) => set({ currentEvent: event }),
  
  setGuests: (guests) => set({ guests }),
  
  addGuest: (guest) => set((state) => ({ 
    guests: [...state.guests, guest] 
  })),
  
  updateGuest: (id, data) => set((state) => ({
    guests: state.guests.map((g) => 
      g.id === id ? { ...g, ...data } : g
    )
  })),
  
  setPhotos: (photos) => set({ photos }),
  
  addPhoto: (photo) => set((state) => ({ 
    photos: [...state.photos, photo] 
  })),
  
  removePhoto: (id) => set((state) => ({
    photos: state.photos.filter((p) => p.id !== id)
  })),
  
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
