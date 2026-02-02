
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  // Tenta buscar no import.meta.env (padrão Vite)
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) return metaEnv[key];
  } catch (e) {}

  // Tenta buscar no process.env (padrão Node/WebContainers)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  // Fallback para busca global se disponível
  try {
    if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) {
      return (window as any).env[key];
    }
  } catch (e) {}

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isConfigured = !!(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseKey.length > 20
);

if (!isConfigured) {
  console.warn("Supabase não detectado via variáveis de ambiente. Verifique o arquivo .env.local ou as configurações do ambiente.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'doutrina-cs-auth'
    }
  }
);
