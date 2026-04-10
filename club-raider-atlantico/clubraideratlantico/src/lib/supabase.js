import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables. ' +
    'Copy .env.example to .env.local and fill in your values.'
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
)

/**
 * Tabla esperada en Supabase (Fase 1):
 * 
 * CREATE TABLE waitlist (
 *   id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email       text UNIQUE NOT NULL,
 *   name        text,
 *   whatsapp    text,
 *   created_at  timestamptz DEFAULT now()
 * );
 * 
 * ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Public insert" ON waitlist FOR INSERT WITH CHECK (true);
 */
