import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const supabaseUrl = 'https://hpbxcpfkzqvpbnkfoxos.supabase.co';

/**
 * ⚠️ ATENÇÃO: Substitua pela sua 'anon' 'public' key real encontrada no painel do Supabase:
 * Settings -> API -> Project API keys -> anon (public)
 */
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYnhjcGZrenF2cGJua2ZveG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTU4NjksImV4cCI6MjA4NDg5MTg2OX0.eO-H88Jy7E25FCdapaUMx6vXQIeD249gpAgu9EdLQ-s'; 

// Verifica se a chave foi alterada para uma chave real do Supabase
export const isConfigured = supabaseKey && 
                            supabaseKey.startsWith('eyJ') && 
                            !supabaseKey.includes('placeholder');

export const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim(), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});