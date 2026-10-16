import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, X, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  isSupabaseConfigured,
  getSupabase,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';
import { syncLocalToSupabase } from '../lib/dataService';

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

  if (!isOpen) return null;

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
            message: 'Conectou ao Supabase! Porém a tabela "dogs" ainda não foi criada. Copie o script SQL abaixo e execute no SQL Editor.',
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
      setSyncResult(`Sincronização concluída: ${result.dogsCount} cães e ${result.checkinsCount} checkins enviados.`);
      onConfigChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao sincronizar';
      setSyncResult(`Falha ao sincronizar: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl text-slate-800 border border-slate-100 max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-[#142e53] text-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fffe42] text-[#142e53] flex items-center justify-center font-black">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">Integração Supabase</h2>
              <p className="text-xs text-slate-200">Backend em tempo real para creche canina</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {isConfigured ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
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

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                SUPABASE_URL <span className="text-slate-400 font-normal">(VITE_SUPABASE_URL)</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                SUPABASE_ANON_KEY <span className="text-slate-400 font-normal">(VITE_SUPABASE_ANON_KEY)</span>
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53]"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#142e53] text-[#fffe42] font-bold text-xs sm:text-sm hover:bg-[#0c1d35] active:scale-95 transition disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>Testar Conexão</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm hover:bg-slate-200 transition"
              >
                Salvar Credenciais
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold ml-auto"
                >
                  Desconectar
                </button>
              )}
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Sync Local Data button */}
          {isConfigured && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Exportar dados de teste para o Supabase</h4>
                  <p className="text-xs text-slate-500">
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
                <p className="mt-2 text-xs font-medium text-emerald-700 bg-white p-2 rounded-lg border border-emerald-100">
                  {syncResult}
                </p>
              )}
            </div>
          )}

          {/* SQL Schema Section */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
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
            <p className="text-xs text-slate-500 mb-2">
              Se ainda não criou as tabelas no seu Supabase, abra o <strong>SQL Editor</strong> do painel e execute este script:
            </p>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-44 border border-slate-800 select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
            <div className="mt-2 text-right">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#142e53] font-bold hover:underline"
              >
                <span>Acessar Painel Supabase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#142e53] text-[#fffe42] font-bold text-sm shadow hover:bg-[#0c1d35] transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
