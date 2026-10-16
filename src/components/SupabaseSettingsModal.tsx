import React, { useState } from 'react';
import {
  Database,
  Check,
  Copy,
  ExternalLink,
  X,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Sun,
  Moon,
  Settings2,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  isSupabaseConfigured,
  getSupabase,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';
import { syncLocalToSupabase } from '../lib/dataService';
import { useTheme } from '../hooks/useTheme';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const { theme, setTheme, isDark, toggleTheme } = useTheme();

  const isConfigured = isSupabaseConfigured();

  const handleSave = async () => {
    saveStoredSupabaseConfig(url, anonKey);
    setTestResult(null);
    onConfigChanged();
  };

  const handleClear = () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigChanged();
  };

  const handleTestConnection = async () => {
    saveStoredSupabaseConfig(url, anonKey);
    setIsTesting(true);
    setTestResult(null);

    const client = getSupabase();
    if (!client) {
      setTestResult({
        success: false,
        message: 'Preencha a URL e a Anon Key válidas do Supabase.',
      });
      setIsTesting(false);
      return;
    }

    try {
      const { error } = await client.from('dogs').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation "public.dogs" does not exist')) {
          setTestResult({
            success: false,
            message:
              'Conectou ao Supabase! Porém a tabela "dogs" ainda não foi criada. Copie o script SQL abaixo e execute no SQL Editor.',
          });
        } else {
          setTestResult({
            success: false,
            message: `Erro do Supabase: ${error.message} (${error.code || 'sem código'})`,
          });
        }
      } else {
        setTestResult({
          success: true,
          message: 'Conexão com o Supabase estabelecida com sucesso e tabelas detectadas!',
        });
        onConfigChanged();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao testar conexão';
      setTestResult({
        success: false,
        message: `Falha na requisição: ${msg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncLocalToSupabase();
      setSyncResult(
        `Sincronização concluída: ${result.dogsCount} cães e ${result.checkinsCount} checkins enviados.`
      );
      onConfigChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao sincronizar';
      setSyncResult(`Falha ao sincronizar: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0d1c31] shadow-2xl text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#1b3356] max-h-[90vh] flex flex-col my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-[#1b3356] bg-[#142e53] dark:bg-[#091424] text-white rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#fffe42] text-[#142e53] flex items-center justify-center font-black shadow-inner">
              <Settings2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
                Configurações & Tema
              </h2>
              <p className="text-xs text-slate-200">
                Aparência do app e integração com banco de dados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* THEME SELECTOR SECTION (DARK MODE NOTURNO CUSTOMIZADO) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12243d] border border-slate-200 dark:border-[#1e3a63] space-y-3.5 transition-colors">
            {/* Title and Switch row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isDark ? 'bg-[#fffe42] text-[#142e53]' : 'bg-[#142e53] text-[#fffe42]'
                }`}>
                  {isDark ? <Moon className="w-4 h-4 stroke-[2.5]" /> : <Sun className="w-4 h-4 stroke-[2.5]" />}
                </div>
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Aparência da Tela
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#142e53] dark:text-[#fffe42] leading-tight">
                    Modo Noturno (Dark Mode)
                  </h4>
                </div>
              </div>

              {/* Interactive Sliding Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                onClick={toggleTheme}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#fffe42] focus:ring-offset-2 ${
                  isDark ? 'bg-[#142e53]' : 'bg-slate-300'
                }`}
                title={isDark ? 'Desativar modo escuro' : 'Ativar modo escuro'}
              >
                <span className="sr-only">Alternar tema claro/escuro</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[#fffe42] text-[#142e53] shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                    isDark ? 'translate-x-6' : 'translate-x-0'
                  }`}
                >
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Alterne entre o tema clássico diurno e o modo escuro customizado. O modo noturno reduz a fadiga ocular em ambientes de pouca luz e facilita o uso ao ar livre ou durante check-outs no final da tarde e noite.
            </p>

            {/* Two Selectable Theme Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              {/* Option: Light Theme */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col text-left p-3 rounded-2xl border transition-all active:scale-98 ${
                  theme === 'light'
                    ? 'bg-white text-[#142e53] border-[#142e53] shadow-md ring-2 ring-[#142e53]/20'
                    : 'bg-white/60 dark:bg-[#091424]/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#1b3356] hover:bg-white dark:hover:bg-[#091424]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                    <Sun className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  {theme === 'light' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#142e53] text-[#fffe42]">
                      Ativo
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                  Tema Claro
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Uso diurno padrão
                </span>
              </button>

              {/* Option: Dark Theme */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col text-left p-3 rounded-2xl border transition-all active:scale-98 ${
                  theme === 'dark'
                    ? 'bg-[#142e53] text-white border-[#fffe42] shadow-lg ring-2 ring-[#fffe42]/40'
                    : 'bg-white/60 dark:bg-[#091424]/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#1b3356] hover:bg-white dark:hover:bg-[#091424]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="p-1.5 rounded-lg bg-[#091424] text-[#fffe42] border border-[#1e3a63]">
                    <Moon className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  {theme === 'dark' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#fffe42] text-[#142e53]">
                      Ativo
                    </span>
                  )}
                </div>
                <span className={`font-extrabold text-xs ${theme === 'dark' ? 'text-[#fffe42]' : 'text-slate-800 dark:text-slate-200'}`}>
                  Modo Escuro
                </span>
                <span className={`text-[11px] mt-0.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  Conforto noturno & OLED
                </span>
              </button>
            </div>
          </div>

          {/* Status Banner Supabase */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              isConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            {isConfigured ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">
                {isConfigured ? 'Supabase Conectado' : 'Operando em Modo de Demonstração / Local'}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {isConfigured
                  ? 'Os dados de cães e check-ins estão sincronizando com o banco de dados Supabase na nuvem.'
                  : 'Você pode usar o app normalmente! Para persistir no Supabase, informe a URL e a Chave Anon abaixo.'}
              </p>
            </div>
          </div>

          {/* Form Supabase */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SUPABASE_URL <span className="text-slate-400 font-normal">(VITE_SUPABASE_URL)</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SUPABASE_ANON_KEY <span className="text-slate-400 font-normal">(VITE_SUPABASE_ANON_KEY)</span>
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#142e53] text-[#fffe42] font-bold text-xs sm:text-sm hover:bg-[#0c1d35] active:scale-95 transition disabled:opacity-50 shadow"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>Testar Conexão</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#12243d] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#1e3a63] font-semibold text-xs sm:text-sm hover:bg-slate-200 transition"
              >
                Salvar Credenciais
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold ml-auto"
                >
                  Desconectar
                </button>
              )}
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Sync Local Data button */}
          {isConfigured && (
            <div className="bg-slate-50 dark:bg-[#12243d] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1e3a63]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Exportar dados de teste para o Supabase
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Envia os cães cadastrados localmente (Thor, Mel, Pipoca, etc.) para o banco Supabase.
                  </p>
                </div>
                <button
                  onClick={handleSyncData}
                  disabled={isSyncing}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                >
                  {isSyncing ? 'Enviando...' : 'Migrar Agora'}
                </button>
              </div>
              {syncResult && (
                <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-white dark:bg-[#0d1c31] p-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  {syncResult}
                </p>
              )}
            </div>
          )}

          {/* SQL Schema Section */}
          <div className="border-t border-slate-200 dark:border-[#1b3356] pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>Estrutura SQL das Tabelas (dogs & checkins)</span>
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#142e53] text-[#fffe42] font-semibold text-xs hover:bg-[#0c1d35] transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Abra o <strong>SQL Editor</strong> do painel Supabase e execute este script para criar as tabelas:
            </p>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-44 border border-slate-800 select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
            <div className="mt-2 text-right">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#142e53] dark:text-[#fffe42] font-bold hover:underline"
              >
                <span>Acessar Painel Supabase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#091424] border-t border-slate-100 dark:border-[#1b3356] flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#142e53] text-[#fffe42] font-bold text-sm shadow hover:bg-[#0c1d35] transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
