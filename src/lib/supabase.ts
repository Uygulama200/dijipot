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
// ============================================
// SUBSCRIPTION TYPES
// ============================================

export type SubscriptionPlan = {
  id: string
  name: string
  slug: string
  price_usd: number
  photo_credits: number
  max_events: number | null
  features: string[]
  is_popular: boolean
  display_order: number
  created_at: string
}

export type UserSubscription = {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'expired' | 'cancelled'
  photo_credits_remaining: number
  photo_credits_total: number
  purchased_at: string
  expires_at: string | null
  created_at: string
  plan?: SubscriptionPlan // Join ile gelirse
}

export type PaymentTransaction = {
  id: string
  user_id: string
  plan_id: string
  amount: number
  currency: string
  payment_provider: string | null
  provider_transaction_id: string | null
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  metadata: Record<string, any>
  created_at: string
}

export type UsageLog = {
  id: string
  user_id: string
  action: string
  credits_used: number
  event_id: string | null
  metadata: Record<string, any>
  created_at: string
}
