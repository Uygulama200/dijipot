import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Studio {
  id: string
  email: string
  name: string | null
  phone: string | null
  logo_url: string | null
  created_at: string
}

export interface Event {
  id: string
  studio_id: string
  name: string
  event_date: string | null
  event_code: string
  qr_code_url: string | null
  status: string
  photo_count: number
  participant_count: number
  created_at: string
}

export interface Photo {
  id: string
  event_id: string
  original_url: string
  thumbnail_url: string | null
  created_at: string
}

export interface Participant {
  id: string
  event_id: string
  phone: string | null
  selfie_url: string | null
  photo_count: number
  created_at: string
}
