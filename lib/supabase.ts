import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for frontend (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for API routes (uses service role key to bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  ticket_id: string
  type: 'early_bird' | 'general'
  quantity: number
  price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'used'
  qr_code?: string
  user_id: string
  payment_id?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  payment_method: string
  paystack_ref?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface EventSettings {
  id: string
  early_bird_price: number
  general_price: number
  early_bird_limit: number
  early_bird_end_date: string
  total_ticket_limit: number
  event_date: string
  event_title: string
  event_time?: string
  venue_name?: string
  venue_address?: string
  admin_email_1?: string
  admin_email_2?: string
  admin_email_3?: string
  early_bird_mode?: string
  early_bird_enabled?: boolean
  created_at: string
  updated_at: string
}
