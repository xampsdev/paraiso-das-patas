import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'creche_supabase_url';
const STORAGE_KEY_KEY = 'creche_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : '') || '';
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : '') || '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    cachedClient = null; // Invalidate cached client
  }
}

export function clearStoredSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    cachedClient = null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getStoredSupabaseConfig();
  return (
    Boolean(url) &&
    url.startsWith('http') &&
    !url.includes('xyzcompany') &&
    !url.includes('your-project') &&
    Boolean(anonKey) &&
    anonKey.length > 20
  );
}

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey || !isSupabaseConfigured()) {
    return null;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (error) {
    console.error('Falha ao inicializar cliente Supabase:', error);
    return null;
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Cole este script no SQL Editor do seu projeto Supabase:

-- 1. Criação da tabela "dogs"
CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tutor_nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criação da tabela "checkins"
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TIME NOT NULL DEFAULT CURRENT_TIME,
  hora_saida TIME,
  observacao_dia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_checkins_data ON public.checkins(data);
CREATE INDEX IF NOT EXISTS idx_checkins_dog_id ON public.checkins(dog_id);
CREATE INDEX IF NOT EXISTS idx_dogs_ativo ON public.dogs(ativo);
CREATE INDEX IF NOT EXISTS idx_dogs_nome ON public.dogs(nome);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acesso livre via anon_key (app operacional interno da creche)
CREATE POLICY "Permitir leitura total para anon" ON public.dogs FOR SELECT USING (true);
CREATE POLICY "Permitir inserção total para anon" ON public.dogs FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização total para anon" ON public.dogs FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão total para anon" ON public.dogs FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de checkins" ON public.checkins FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de checkins" ON public.checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de checkins" ON public.checkins FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de checkins" ON public.checkins FOR DELETE USING (true);

-- 6. Habilitar Realtime para checkins (opcional mas recomendado)
ALTER PUBLICATION supabase_realtime ADD TABLE public.dogs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins;
`;
